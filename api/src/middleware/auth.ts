import { Request, Response, NextFunction } from 'express';

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

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid session',
      });
      return;
    }

    // Attach user info to request
    // Note: We trust the session since it's stored server-side with secure cookies
    // Token validation is skipped for performance - sessions expire after 24 hours
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

