import { describe, expect, it } from 'vitest';
import { buildAuthorizeUrl, createPkce, createState } from './entra';

describe('PKCE helpers', () => {
  it('creates a verifier and matching challenge', () => {
    const { codeVerifier, codeChallenge } = createPkce();
    expect(codeVerifier.length).toBeGreaterThan(20);
    expect(codeChallenge.length).toBeGreaterThan(20);
    // base64url: no +, /, or = padding
    expect(codeChallenge).not.toMatch(/[+/=]/);
  });

  it('creates a random state', () => {
    expect(createState()).not.toBe(createState());
  });
});

describe('buildAuthorizeUrl', () => {
  it('includes the PKCE challenge, S256 method and redirect uri', () => {
    const url = new URL(buildAuthorizeUrl({ state: 'st', codeChallenge: 'ch' }));
    expect(url.searchParams.get('code_challenge')).toBe('ch');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('state')).toBe('st');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:8787/api/auth/callback');
  });
});
