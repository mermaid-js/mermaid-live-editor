import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#lib/util/env.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('#lib/util/env.js')>();
  return {
    ...original,
    MCBaseURL: 'https://mermaid.ai',
    env: { ...original.env, isEnabledMermaidChartLinks: true }
  };
});

const loadAt = async (now: string) => {
  vi.setSystemTime(new Date(now));
  vi.resetModules();
  return await import('./promo.svelte');
};

const activeIdAt = async (now: string) => (await loadAt(now)).getActivePromotion()?.id;

describe('November Mermaid Flow promotion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the JS26 banner before 12:01 AM PT on November 19th', async () => {
    expect(await activeIdAt('2026-11-19T00:00:59-08:00')).toBe('promo-js-2026');
  });

  it('puts Flow ahead of JS26 from November 19th to December 31st', async () => {
    expect(await activeIdAt('2026-11-19T00:01:01-08:00')).toBe('promo-november-flow');
    expect(await activeIdAt('2026-12-31T23:58:59-08:00')).toBe('promo-november-flow');
  });

  it('falls back to the regular banner once both campaigns are over', async () => {
    expect(await activeIdAt('2027-01-01T00:00:01-08:00')).toBe('promo-april-2025');
  });

  it('shows JS26 while the Flow banner is dismissed', async () => {
    const promo = await loadAt('2026-11-23T12:00:00-08:00');
    promo.dismissPromotion('promo-november-flow');
    expect(promo.getActivePromotion()?.id).toBe('promo-js-2026');
  });
});
