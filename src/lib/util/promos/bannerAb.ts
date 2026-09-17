import { readJSON, writeJSON } from '../persist.svelte';

export const BANNER_AB_KEY = 'bannerAbVariant';
export const BANNER_AB_VARIANTS = ['control', 'testB'] as const;

export type BannerAbVariant = (typeof BANNER_AB_VARIANTS)[number];

export const isBannerAbVariant = (value: unknown): value is BannerAbVariant =>
  value === 'control' || value === 'testB';

export const assignBannerVariant = (
  stored: unknown,
  random: () => number = Math.random
): BannerAbVariant => {
  if (isBannerAbVariant(stored)) {
    return stored;
  }
  return random() < 0.5 ? 'control' : 'testB';
};

export const getBannerVariant = (random: () => number = Math.random): BannerAbVariant => {
  const assigned = assignBannerVariant(readJSON<unknown>(BANNER_AB_KEY, undefined), random);
  writeJSON(BANNER_AB_KEY, assigned);
  return assigned;
};
