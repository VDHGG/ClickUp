import { Router, Request, Response } from 'express';
import { getOpenIDClient, getAuthorizationUrl } from '../config/openid';
import crypto from 'crypto';

export const authRouter = Router();

// Store state for CSRF protection (in production, use Redis or session store)
const stateStore = new Map<string, { state: string; expiresAt: number }>();

// Cleanup expired states every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of stateStore.entries()) {
    if (value.expiresAt < now) {
      stateStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

// GET /auth/login - Initiate OpenID login
authRouter.get('/login', async (req: Request, res: Response) => {
  try {
    // Initialize OpenID client
    await getOpenIDClient();

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    const sessionId = (req as any).sessionID || crypto.randomBytes(16).toString('hex');
    
    // Store state with expiration (10 minutes)
    stateStore.set(sessionId, {
      state,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Store state in session if available
    if ((req as any).session) {
      (req as any).session.state = state;
    }

    // Get authorization URL
    const authUrl = await getAuthorizationUrl(state);

    // Redirect to MindX ID authorization endpoint
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating login:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /auth/callback - Handle OpenID callback
authRouter.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    // Check for errors from OpenID provider
    if (error) {
      console.error('OpenID error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io';
      return res.redirect(`${frontendUrl}?error=${encodeURIComponent(error as string)}`);
    }

    // Ensure code and state are strings
    const codeStr = typeof code === 'string' 
      ? code 
      : Array.isArray(code) && typeof code[0] === 'string' 
        ? code[0] 
        : undefined;
    const stateStr = typeof state === 'string' 
      ? state 
      : Array.isArray(state) && typeof state[0] === 'string' 
        ? state[0] 
        : undefined;

    if (!codeStr || !stateStr) {
      const frontendUrl = process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io';
      return res.redirect(`${frontendUrl}?error=missing_code_or_state`);
    }

    // Verify state (CSRF protection)
    const sessionId = (req as any).sessionID || '';
    const storedState = stateStore.get(sessionId);
    
    // Also check session state if available
    const sessionState = (req as any).session?.state;
    const isValidState = storedState?.state === stateStr || sessionState === stateStr;
    
    if (!isValidState) {
      const frontendUrl = process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io';
      return res.redirect(`${frontendUrl}?error=invalid_state`);
    }

    // Clean up used state
    if (storedState) {
      stateStore.delete(sessionId);
    }

    // Get OpenID client
    const client = await getOpenIDClient();
    const redirectUri = process.env.OPENID_REDIRECT_URI || 'https://clickup.48-218-233-16.nip.io/api/auth/callback';

    // Exchange authorization code for tokens
    const tokenSet = await client.callback(
      redirectUri,
      { code: codeStr, state: stateStr },
      { state: stateStr }
    );

    // Get user info
    const userInfo = await client.userinfo(tokenSet.access_token!);

    // Store token and user info in session
    if ((req as any).session) {
      (req as any).session.accessToken = tokenSet.access_token;
      (req as any).session.idToken = tokenSet.id_token;
      (req as any).session.user = {
        sub: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        preferred_username: userInfo.preferred_username,
      };
      (req as any).session.isAuthenticated = true;
    }

    // Redirect to frontend dashboard (logged in)
    const frontendUrl = process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io';
    res.redirect(frontendUrl);
  } catch (error) {
    console.error('Error handling callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.redirect(`${frontendUrl}?error=${encodeURIComponent(errorMessage)}`);
  }
});

// GET /auth/me - Get current user info from session
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    // Check session
    if (!(req as any).session || !(req as any).session.isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = (req as any).session.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found in session',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user info',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /auth/logout - Logout
authRouter.post('/logout', (req: Request, res: Response) => {
  // Clear session
  if ((req as any).session) {
    (req as any).session.destroy((err: Error) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({
          success: false,
          message: 'Error during logout',
        });
      }
      
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  } else {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
});

