import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE, signSession, sessionCookieOptions, verifySession } from './jwt';
import { extractBearer, isValidMcpToken, resolveMcpUserId } from './mcpToken';

export interface AuthedRequest extends Request {
  userId: string;
}

/**
 * Authenticate a request, by either:
 *  1. A static MCP API token (`Authorization: Bearer <MCP_API_TOKEN>`) — resolves
 *     to the MCP_API_EMAIL user. No cookie is issued (headless clients don't want
 *     one, and PAT/session lifetimes stay independent).
 *  2. The `mle_session` cookie — verified, with a rolling refresh on each request.
 *
 * On success attaches `req.userId` and continues; otherwise responds 401.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1. Static MCP token.
  const bearer = extractBearer(req.headers.authorization);
  if (bearer !== null && isValidMcpToken(bearer)) {
    const userId = await resolveMcpUserId();
    if (!userId) {
      res.status(401).json({
        error: 'MCP user not provisioned — sign in to the editor once as MCP_API_EMAIL'
      });
      return;
    }
    (req as AuthedRequest).userId = userId;
    next();
    return;
  }

  // 2. Session cookie.
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
