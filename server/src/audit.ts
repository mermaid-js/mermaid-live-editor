import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { logger } from './logger';

/**
 * Append an entry to the audit log. Best-effort: failures are logged but never
 * propagated, so auditing can't break the request it describes.
 */
export const writeAudit = async (
  userId: string | null,
  action: string,
  meta?: Record<string, unknown>
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ...(meta ? { meta: meta as Prisma.InputJsonValue } : {})
      }
    });
  } catch (error) {
    logger.error({ error, action, userId }, 'Failed to write audit log entry');
  }
};
