import { Request, Response, NextFunction } from 'express';
import { getOpenIDClient } from '../config/openid';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    name?: string;
    email?: string;
    preferred_username?: string;
  };
}

export async function authenticateSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check session
    if (!(req as any).session || !(req as any).session.isAuthenticated) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const user = (req as any).session.user;
    const accessToken = (req as any).session.accessToken;

    if (!user || !accessToken) {
      res.status(401).json({
        success: false,
        message: 'Invalid session',
      });
      return;
    }

    // Verify token is still valid (optional - can skip for performance)
    try {
      const client = await getOpenIDClient();
      await client.userinfo(accessToken);
    } catch (error) {
      // Token expired or invalid - clear session
      console.error('Token validation error:', error);
      (req as any).session.destroy(() => {
        res.status(401).json({
          success: false,
          message: 'Session expired',
        });
      });
      return;
    }

    // Attach user info to request
    req.user = user;

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
}

