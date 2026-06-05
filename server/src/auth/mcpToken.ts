import { timingSafeEqual } from 'node:crypto';
import { prisma } from '../db';
import { env, mcpApiEmail } from '../env';

/**
 * Static-token auth for non-interactive clients (the MCP server). A request that
 * presents `Authorization: Bearer <MCP_API_TOKEN>` is authenticated as the
 * MCP_API_EMAIL user. See server/src/auth/middleware.ts for how this slots in
 * ahead of the cookie session.
 */

const BEARER_PREFIX = 'Bearer ';

/** Pull the raw token out of an `Authorization: Bearer <token>` header. */
export const extractBearer = (header: string | undefined): string | null => {
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return null;
  }
  const token = header.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
};

/**
 * Constant-time comparison of a presented token against an expected one. Returns
 * false when no token is configured (`expected` empty → Bearer auth disabled) or
 * on any length/value mismatch.
 */
export const compareToken = (provided: string, expected: string | undefined): boolean => {
  if (!expected) {
    return false;
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on unequal lengths, so guard first. Length is not a
  // useful side channel here: the token is high-entropy and fixed-length.
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
};

/** True when `provided` matches the configured MCP_API_TOKEN (constant-time). */
export const isValidMcpToken = (provided: string): boolean =>
  compareToken(provided, env.MCP_API_TOKEN);

// email → userId is stable, so resolve it once and reuse.
let cachedUserId: string | null = null;

/**
 * Resolve the MCP token's user id (looked up by mcpApiEmail). Returns null when
 * no MCP email is configured or the user has not signed in yet (no row).
 */
export const resolveMcpUserId = async (): Promise<string | null> => {
  if (cachedUserId) {
    return cachedUserId;
  }
  if (!mcpApiEmail) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { email: mcpApiEmail },
    select: { id: true }
  });
  cachedUserId = user?.id ?? null;
  return cachedUserId;
};

// Test-only: reset the memoized user id between cases.
export const _resetMcpUserCache = (): void => {
  cachedUserId = null;
};
