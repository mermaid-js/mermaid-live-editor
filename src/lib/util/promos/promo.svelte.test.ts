import { beforeEach, describe, expect, it } from 'vitest';
import { writeJSON } from '../persist.svelte';
import { BANNER_AB_KEY } from './bannerAb';
import JS2026 from './JS2026.svelte';
import { getActivePromotion } from './promo.svelte';
import VisualTestB from './VisualTestB.svelte';

describe('getActivePromotion A/B', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps the discount banner for the control bucket', () => {
    writeJSON(BANNER_AB_KEY, 'control');
    const promo = getActivePromotion();
    expect(promo?.id).toBe('promo-js-2026');
    expect(promo?.variant).toBe('control');
    expect(promo?.component).toBe(JS2026);
  });

  it('swaps in the visual-editor banner for the testB bucket', () => {
    writeJSON(BANNER_AB_KEY, 'testB');
    const promo = getActivePromotion();
    expect(promo?.id).toBe('promo-js-2026');
    expect(promo?.variant).toBe('testB');
    expect(promo?.component).toBe(VisualTestB);
  });
});
