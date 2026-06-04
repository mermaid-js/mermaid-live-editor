import crypto from 'node:crypto';
import type { EntraEffectiveConfig } from '../integrations/entraConfig';

const authorityFor = (tenantId: string): string =>
  `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0`;
const SCOPES = 'openid profile email';

const base64url = (input: Buffer): string => input.toString('base64url');

export interface Pkce {
  codeVerifier: string;
  codeChallenge: string;
}

export const createPkce = (): Pkce => {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
};

export const createState = (): string => base64url(crypto.randomBytes(16));

export const buildAuthorizeUrl = ({
  state,
  codeChallenge,
  config
}: {
  state: string;
  codeChallenge: string;
  config: EntraEffectiveConfig;
}): string => {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    response_mode: 'query',
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  return `${authorityFor(config.tenantId)}/authorize?${params.toString()}`;
};

export interface EntraClaims {
  oid: string;
  email: string;
  displayName?: string;
}

interface TokenResponse {
  id_token?: string;
  error?: string;
  error_description?: string;
}

interface IdTokenClaims {
  oid?: string;
  sub?: string;
  email?: string;
  preferred_username?: string;
  upn?: string;
  name?: string;
}

const decodeIdToken = (idToken: string): IdTokenClaims => {
  const parts = idToken.split('.');
  if (parts.length !== 3 || !parts[1]) {
    throw new Error('Malformed id_token');
  }
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as IdTokenClaims;
};

/**
 * Exchange an authorization code (with the PKCE verifier) for tokens, and return
 * the identity claims we care about.
 *
 * The code is exchanged server-to-server over TLS with the confidential client
 * secret, so the returned id_token is trusted without a separate JWKS signature
 * check. For defence-in-depth you may later add full JWKS validation here.
 */
export const exchangeCodeForClaims = async ({
  code,
  codeVerifier,
  config
}: {
  code: string;
  codeVerifier: string;
  config: EntraEffectiveConfig;
}): Promise<EntraClaims> => {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
    scope: SCOPES
  });

  const response = await fetch(`${authorityFor(config.tenantId)}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const data = (await response.json()) as TokenResponse;

  if (!response.ok || !data.id_token) {
    throw new Error(
      `Entra token exchange failed: ${data.error ?? response.status} ${
        data.error_description ?? ''
      }`.trim()
    );
  }

  const claims = decodeIdToken(data.id_token);
  const oid = claims.oid ?? claims.sub;
  const email = claims.email ?? claims.preferred_username ?? claims.upn;

  if (!oid || !email) {
    throw new Error('Entra id_token is missing required claims (oid/email)');
  }

  return { oid, email, displayName: claims.name };
};
