import { beforeEach, describe, expect, it } from 'vitest';
import { C } from '$/constants';
import { MCBaseURL } from '$/util/env';
import { getSignupUrl } from '$/util/util';
import { assignBannerVariant, BANNER_AB_KEY, getBannerVariant } from './bannerAb';

describe('assignBannerVariant', () => {
  it('returns the stored variant without re-rolling', () => {
    expect(assignBannerVariant('control', () => 0.9)).toBe('control');
    expect(assignBannerVariant('testB', () => 0.1)).toBe('testB');
  });

  it('assigns control when the random draw is below 0.5', () => {
    expect(assignBannerVariant(undefined, () => 0.49)).toBe('control');
  });

  it('assigns testB when the random draw is 0.5 or above', () => {
    expect(assignBannerVariant(undefined, () => 0.5)).toBe('testB');
  });

  it('re-assigns when stored value is invalid', () => {
    expect(assignBannerVariant('promo-js-2026', () => 0.1)).toBe('control');
    expect(assignBannerVariant('', () => 0.8)).toBe('testB');
  });
});

describe('getBannerVariant', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists a new assignment so later visits stay sticky', () => {
    expect(getBannerVariant(() => 0.8)).toBe('testB');
    expect(window.localStorage.getItem(BANNER_AB_KEY)).toBe('"testB"');
    expect(getBannerVariant(() => 0.1)).toBe('testB');
  });
});

describe('getSignupUrl', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/edit');
  });

  it('points at the Mermaid Chart sign-up page with banner UTMs', () => {
    const url = new URL(getSignupUrl({ utmCampaign: 'visual_testB', utmMedium: 'banner_ad' }));

    expect(url.origin + url.pathname).toBe(`${MCBaseURL}/app/sign-up`);
    expect(url.searchParams.get('utm_source')).toBe(C.utmSource);
    expect(url.searchParams.get('utm_medium')).toBe('banner_ad');
    expect(url.searchParams.get('utm_campaign')).toBe('visual_testB');
  });
});
