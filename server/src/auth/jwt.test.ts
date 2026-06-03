import { describe, expect, it } from 'vitest';
import { signOAuthTx, signSession, verifyOAuthTx, verifySession } from './jwt';

describe('session tokens', () => {
  it('round-trips a user id', () => {
    const token = signSession('user-123');
    expect(verifySession(token)).toEqual({ sub: 'user-123' });
  });

  it('rejects a tampered token', () => {
    expect(() => verifySession('not-a-jwt')).toThrow();
  });
});

describe('oauth transaction tokens', () => {
  it('round-trips state and code verifier', () => {
    const token = signOAuthTx({ state: 's', codeVerifier: 'v' });
    expect(verifyOAuthTx(token)).toEqual({ state: 's', codeVerifier: 'v' });
  });
});
