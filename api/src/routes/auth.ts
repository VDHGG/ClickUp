import { Router, Request, Response } from 'express';
import { getOpenIDClient, getAuthorizationUrl } from '../config/openid';
import { trackEvent, trackException } from '../config/appinsights';
import crypto from 'crypto';

export const authRouter = Router();

// ⚠️ WARNING: Memory store is NOT suitable for production with multiple replicas
// If AKS runs ≥ 2 replicas:
//   /login  → pod A (state stored in memory)
//   /callback → pod B (state NOT found in memory)
//   → ❌ invalid_state
// 
// ✅ PRODUCTION FIX: Use Redis session store
//   - Azure Cache for Redis
//   - express-session + connect-redis
// 
// 🔧 TEMPORARY FIX: Scale to 1 replica for testing
//   kubectl scale deployment clickup-api --replicas=1
//
// State is stored PRIMARILY in session (reliable across replicas)
// Memory store is only used as fallback
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

    // Ensure session is created (touch session to create it)
    if (!(req as any).session) {
      console.error('Session not available in /auth/login');
      return res.status(500).json({
        success: false,
        message: 'Session initialization failed',
      });
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    const sessionId = (req as any).sessionID;
    
    console.log(`[AUTH] Login initiated - SessionID: ${sessionId?.substring(0, 8)}..., State: ${state.substring(0, 8)}...`);

    // Store state in session FIRST (most reliable)
    (req as any).session.state = state;
    (req as any).session.stateCreatedAt = Date.now();
    
    // Also store in memory store as backup (with expiration - 10 minutes)
    if (sessionId) {
      stateStore.set(sessionId, {
        state,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
    }

    // Save session explicitly to ensure cookie is set
    await new Promise<void>((resolve, reject) => {
      (req as any).session.save((err: Error) => {
        if (err) {
          console.error('Error saving session:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Get authorization URL
    const authUrl = await getAuthorizationUrl(state);
    
    console.log(`[AUTH] Redirecting to: ${authUrl.substring(0, 100)}...`);

    // Track login initiation event
    trackEvent('AuthLoginInitiated', {
      sessionId: sessionId?.substring(0, 8) || 'unknown',
    });

    // Redirect to MindX ID authorization endpoint
    res.redirect(authUrl);
  } catch (error) {
    console.error('[AUTH] Error initiating login:', error);
    
    // Track error
    if (error instanceof Error) {
      trackException(error, {
        endpoint: '/api/auth/login',
        action: 'login_initiation',
      });
    }
    
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

    console.log(`[AUTH] Callback received - Code: ${code ? 'present' : 'missing'}, State: ${state ? 'present' : 'missing'}, Error: ${error || 'none'}`);
    console.log(`[AUTH] SessionID: ${(req as any).sessionID?.substring(0, 8) || 'none'}...`);
    console.log(`[AUTH] Session exists: ${!!(req as any).session}`);

    // Check for errors from OpenID provider
    if (error) {
      console.error('[AUTH] OpenID provider error:', error);
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
      console.error('[AUTH] Missing code or state:', { code: !!codeStr, state: !!stateStr });
      const frontendUrl = process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io';
      return res.redirect(`${frontendUrl}?error=missing_code_or_state`);
    }

    // Verify state (CSRF protection)
    const sessionId = (req as any).sessionID || '';
    const sessionState = (req as any).session?.state;
    const stateCreatedAt = (req as any).session?.stateCreatedAt;
    const storedState = stateStore.get(sessionId);
    
    console.log(`[AUTH] State validation:`);
    console.log(`  - SessionID: ${sessionId ? sessionId.substring(0, 16) + '...' : 'MISSING'}`);
    console.log(`  - Session exists: ${!!(req as any).session}`);
    console.log(`  - Session state: ${sessionState ? sessionState.substring(0, 16) + '...' : 'MISSING'}`);
    console.log(`  - Received state: ${stateStr.substring(0, 16)}...`);
    console.log(`  - Memory store state: ${storedState?.state ? storedState.state.substring(0, 16) + '...' : 'MISSING'}`);
    console.log(`  - State created at: ${stateCreatedAt ? new Date(stateCreatedAt).toISOString() : 'MISSING'}`);
    
    // 🔥 PRIMARY: Check session state (works across replicas)
    // 🔧 FALLBACK: Check memory store (only works if same pod)
    let isValidState = false;
    let validationSource = 'none';
    
    if (sessionState === stateStr) {
      isValidState = true;
      validationSource = 'session';
      console.log('[AUTH] ✅ State validated from SESSION (reliable across replicas)');
    } else if (storedState?.state === stateStr) {
      isValidState = true;
      validationSource = 'memory';
      console.log('[AUTH] ⚠️ State validated from MEMORY STORE (only works if same pod)');
      console.log('[AUTH] ⚠️ WARNING: This suggests session cookie was not sent - check sameSite/secure settings');
    } else {
      console.error('[AUTH] ❌ State mismatch!');
      console.error('  - Session state:', sessionState ? sessionState.substring(0, 16) + '...' : 'MISSING');
      console.error('  - Received state:', stateStr.substring(0, 16) + '...');
      console.error('  - Memory store state:', storedState?.state ? storedState.state.substring(0, 16) + '...' : 'MISSING');
      console.error('  - SessionID changed? Original might be different pod');
    }
    
    // Check if state expired (10 minutes)
    if (stateCreatedAt && Date.now() - stateCreatedAt > 10 * 60 * 1000) {
      console.error('[AUTH] ❌ State expired (older than 10 minutes)');
      isValidState = false;
    }
    
    // Additional check: if session exists but state is missing, it's likely a new session
    if ((req as any).session && !sessionState && !storedState) {
      console.error('[AUTH] ❌ Session exists but state is missing - likely new session (cookie not sent?)');
      console.error('[AUTH]    Check: sameSite, secure, trust proxy settings');
    }
    
    if (!isValidState) {
      console.error('[AUTH] Invalid state - redirecting to frontend with error');
      const frontendUrl = process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io';
      return res.redirect(`${frontendUrl}?error=invalid_state`);
    }

    // Clean up used state
    if (storedState) {
      stateStore.delete(sessionId);
    }
    if ((req as any).session) {
      delete (req as any).session.state;
      delete (req as any).session.stateCreatedAt;
    }

    // Get OpenID client
    const client = await getOpenIDClient();
    const redirectUri = process.env.OPENID_REDIRECT_URI || 'https://clickup.48-218-233-16.nip.io/api/auth/callback';

    console.log('[AUTH] Exchanging code for tokens...');
    console.log('[AUTH] Redirect URI:', redirectUri);
    console.log('[AUTH] Code present:', !!codeStr);
    console.log('[AUTH] State present:', !!stateStr);

    // Exchange authorization code for tokens
    // 🔥 FIX: Issuer created manually in getOpenIDClient() to bypass strict OIDC validation
    // This should prevent "iss missing from the response" error
    const tokenSet = await client.callback(
      redirectUri,
      { code: codeStr, state: stateStr },
      { state: stateStr }
    );

    console.log('[AUTH] Tokens received, fetching user info...');

    // Get user info
    const userInfo = await client.userinfo(tokenSet.access_token!);

    console.log('[AUTH] User info received:', { sub: userInfo.sub, email: userInfo.email });

    // Store token and user info in session
    if ((req as any).session) {
      (req as any).session.accessToken = tokenSet.access_token;
      (req as any).session.idToken = tokenSet.id_token;
      // 🔥 FIX: Ensure sub is always set (use email or preferred_username as fallback)
      const userId = userInfo.sub || userInfo.preferred_username || userInfo.email || 'unknown';
      (req as any).session.user = {
        sub: userId,
        name: userInfo.name,
        email: userInfo.email,
        preferred_username: userInfo.preferred_username,
      };
      (req as any).session.isAuthenticated = true;
      
      // Save session explicitly
      await new Promise<void>((resolve, reject) => {
        (req as any).session.save((err: Error) => {
          if (err) {
            console.error('[AUTH] Error saving session after auth:', err);
            reject(err);
          } else {
            console.log('[AUTH] Session saved successfully');
            resolve();
          }
        });
      });
    }

    // Track successful authentication
    // 🔥 FIX: Use fallback for userId if sub is not available
    const userId = userInfo.sub || userInfo.preferred_username || userInfo.email || 'unknown';
    trackEvent('AuthLoginSuccess', {
      userId: userId,
      email: userInfo.email || 'unknown',
    });

    // Redirect to frontend dashboard (logged in)
    const frontendUrl = process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io';
    console.log(`[AUTH] Authentication successful, redirecting to: ${frontendUrl}`);
    res.redirect(frontendUrl);
  } catch (error) {
    console.error('[AUTH] Error handling callback:', error);
    
    // Track authentication error
    if (error instanceof Error) {
      trackException(error, {
        endpoint: '/api/auth/callback',
        action: 'callback_processing',
      });
    }
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://clickup.48-218-233-16.nip.io';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Track failed authentication
    trackEvent('AuthLoginFailed', {
      error: errorMessage,
    });
    
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
  const user = (req as any).session?.user;
  
  // Clear session
  if ((req as any).session) {
    (req as any).session.destroy((err: Error) => {
      if (err) {
        console.error('Error destroying session:', err);
        trackException(err, {
          endpoint: '/api/auth/logout',
          action: 'session_destroy',
        });
        return res.status(500).json({
          success: false,
          message: 'Error during logout',
        });
      }
      
      // Track logout event
      trackEvent('AuthLogout', {
        userId: user?.sub || 'unknown',
      });
      
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  } else {
    trackEvent('AuthLogout', {
      userId: 'unknown',
    });
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
});

