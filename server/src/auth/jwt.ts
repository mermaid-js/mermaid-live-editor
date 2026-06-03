import type { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { env, isProd } from '../env';

export const SESSION_COOKIE = 'mle_session';
export const OAUTH_TX_COOKIE = 'mle_oauth_tx';

// SameSite=Lax (not Strict): the OAuth callback is a top-level navigation coming
// back from login.microsoftonline.com, so the transaction cookie must survive a
// cross-site redirect. The editor and API share one origin, so the editor's
// same-origin fetch()es still send the session cookie under Lax.
const baseCookie: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/'
};

export interface SessionClaims {
  sub: string;
}

export const signSession = (userId: string): string =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.SESSION_TTL_SECONDS });

export const verifySession = (token: string): SessionClaims => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new Error('Invalid session token');
  }
  return { sub: decoded.sub };
};

export const sessionCookieOptions = (): CookieOptions => ({
  ...baseCookie,
  maxAge: env.SESSION_TTL_SECONDS * 1000
});

export const clearCookieOptions = (): CookieOptions => ({ ...baseCookie });

export interface OAuthTx {
  state: string;
  codeVerifier: string;
}

// Short-lived signed token carrying the PKCE verifier + state across the redirect.
export const signOAuthTx = (tx: OAuthTx): string =>
  jwt.sign(tx, env.JWT_SECRET, { expiresIn: 600 });

export const verifyOAuthTx = (token: string): OAuthTx => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (
    typeof decoded === 'string' ||
    typeof decoded.state !== 'string' ||
    typeof decoded.codeVerifier !== 'string'
  ) {
    throw new Error('Invalid OAuth transaction token');
  }
  return { state: decoded.state, codeVerifier: decoded.codeVerifier };
};

export const oauthTxCookieOptions = (): CookieOptions => ({
  ...baseCookie,
  maxAge: 600 * 1000
});
