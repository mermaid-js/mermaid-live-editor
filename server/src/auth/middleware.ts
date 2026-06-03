import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE, signSession, sessionCookieOptions, verifySession } from './jwt';

export interface AuthedRequest extends Request {
  userId: string;
}

/**
 * Verify the session cookie. On success attaches `req.userId`, re-issues a fresh
 * cookie (rolling 1h session), and continues. On failure responds 401.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token: unknown = (req.cookies as Record<string, unknown> | undefined)?.[SESSION_COOKIE];
  if (typeof token !== 'string') {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const { sub } = verifySession(token);
    (req as AuthedRequest).userId = sub;
    // Rolling refresh: extend the session on each authenticated request.
    res.cookie(SESSION_COOKIE, signSession(sub), sessionCookieOptions());
    next();
  } catch {
    res.status(401).json({ error: 'Session expired or invalid' });
  }
};
