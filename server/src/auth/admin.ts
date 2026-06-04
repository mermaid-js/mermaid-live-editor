import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db';
import { isAdminEmail } from '../env';
import type { AuthedRequest } from './middleware';

/**
 * Gate a route to admins. MUST run after `requireAuth` (relies on `req.userId`).
 * Resolves the user's email and checks it against the ADMIN_EMAILS allowlist.
 * Responds 403 otherwise.
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req as AuthedRequest;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  });

  if (!user || !isAdminEmail(user.email)) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};
