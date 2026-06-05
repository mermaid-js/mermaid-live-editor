import { describe, expect, it } from 'vitest';
import { compareToken, extractBearer } from './mcpToken';

describe('extractBearer', () => {
  it('returns the token from a Bearer header', () => {
    expect(extractBearer('Bearer mle_pat_abc123')).toBe('mle_pat_abc123');
  });

  it('trims surrounding whitespace', () => {
    expect(extractBearer('Bearer   spaced  ')).toBe('spaced');
  });

  it('returns null for a missing or non-Bearer header', () => {
    expect(extractBearer(undefined)).toBeNull();
    expect(extractBearer('')).toBeNull();
    expect(extractBearer('Basic abc')).toBeNull();
    expect(extractBearer('bearer lowercase')).toBeNull();
  });

  it('returns null for an empty Bearer token', () => {
    expect(extractBearer('Bearer ')).toBeNull();
    expect(extractBearer('Bearer    ')).toBeNull();
  });
});

describe('compareToken', () => {
  const token = 'a-sufficiently-long-secret-token-value';

  it('accepts an exact match', () => {
    expect(compareToken(token, token)).toBe(true);
  });

  it('rejects a wrong token of equal length', () => {
    const wrong = 'X'.repeat(token.length);
    expect(compareToken(wrong, token)).toBe(false);
  });

  it('rejects a token of different length', () => {
    expect(compareToken(token + 'x', token)).toBe(false);
    expect(compareToken('short', token)).toBe(false);
  });

  it('is disabled when no token is configured', () => {
    expect(compareToken(token, undefined)).toBe(false);
    expect(compareToken(token, '')).toBe(false);
  });
});
