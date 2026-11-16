import { beforeEach, describe, expect, it, vi } from 'vitest';

const load = async () => {
  vi.resetModules();
  return (await import('./v13.svelte')).v13;
};

describe('v13 variant assignment', () => {
  beforeEach(() => localStorage.clear());

  it('assigns a random variant once and keeps it', async () => {
    const { variant } = await load();
    expect(['chip', 'peek', 'pill']).toContain(variant);
    expect(JSON.parse(localStorage.getItem('v13Variant') ?? '""')).toBe(variant);
    expect((await load()).variant).toBe(variant);
  });

  it('keeps a stored variant', async () => {
    localStorage.setItem('v13Variant', JSON.stringify('peek'));
    expect((await load()).variant).toBe('peek');
  });

  it('replaces an unknown stored variant', async () => {
    localStorage.setItem('v13Variant', JSON.stringify('banner'));
    expect(['chip', 'peek', 'pill']).toContain((await load()).variant);
  });
});
