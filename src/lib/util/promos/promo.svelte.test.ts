import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flowHuntBanners, FLOW_HUNT_LAUNCH_URL } from './flowHunt';

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

describe('Mermaid Flow Product Hunt promotions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('replaces the regular banner with the pre-launch one before launch day', async () => {
    expect(await activeIdAt('2026-11-12T12:00:00Z')).toBe('promo-flow-hunt-pre-launch');
  });

  it('keeps the pre-launch banner until 12:01 AM PT on November 18th', async () => {
    expect(await activeIdAt('2026-11-18T00:00:59-08:00')).toBe('promo-flow-hunt-pre-launch');
  });

  it('uses Pacific time, not UTC', async () => {
    // Already November 18th in UTC, still November 17th in Pacific time.
    expect(await activeIdAt('2026-11-18T03:00:00Z')).toBe('promo-flow-hunt-pre-launch');
  });

  it('switches to the launch banner once the launch starts', async () => {
    expect(await activeIdAt('2026-11-18T00:01:01-08:00')).toBe('promo-flow-hunt-launch');
    expect(await activeIdAt('2026-11-18T23:58:59-08:00')).toBe('promo-flow-hunt-launch');
  });

  it('goes back to the regular banner at 11:59 PM PT on November 18th', async () => {
    expect(await activeIdAt('2026-11-18T23:59:01-08:00')).toBe('promo-js-2026');
  });

  it('still shows the launch banner after the pre-launch one was dismissed', async () => {
    const preLaunch = await loadAt('2026-11-17T12:00:00-08:00');
    preLaunch.dismissPromotion('promo-flow-hunt-pre-launch');
    expect(preLaunch.getActivePromotion()?.id).not.toBe('promo-flow-hunt-pre-launch');

    expect(await activeIdAt('2026-11-18T12:00:00-08:00')).toBe('promo-flow-hunt-launch');
  });

  it('keeps a dismissed launch banner closed for the rest of launch day', async () => {
    const launch = await loadAt('2026-11-18T01:00:00-08:00');
    launch.dismissPromotion('promo-flow-hunt-launch');

    expect(await activeIdAt('2026-11-18T23:00:00-08:00')).not.toBe('promo-flow-hunt-launch');
  });
});

describe('Mermaid Flow Product Hunt copy', () => {
  it('has the pre-launch copy from the ticket', () => {
    expect(flowHuntBanners['pre-launch']).toEqual({
      headline: 'Mermaid Flow launches on Product Hunt November 18th.',
      tagline: 'Build it once, run it the same way every time.',
      cta: 'Learn more'
    });
  });

  it('has the launch copy and Product Hunt link from the ticket', () => {
    expect(flowHuntBanners.launch).toEqual({
      headline: 'Mermaid Flow is live on Product Hunt.',
      tagline: 'Build it once, run it the same way every time.',
      cta: 'See the launch'
    });
    expect(FLOW_HUNT_LAUNCH_URL).toBe(
      'https://www.producthunt.com/products/mermaid-chart?launch=mermaid-flow'
    );
  });
});
