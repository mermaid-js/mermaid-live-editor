import { env } from '$lib/util/env';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import type { Component, Snippet } from 'svelte';
import { persisted } from '../persist.svelte';
import April2025 from './April2025.svelte';
import JS2026 from './JS2026.svelte';

dayjs.extend(duration);

interface Promotion {
  startDate: Date;
  endDate: Date;
  component: Component<{ closeBanner: Snippet }>;
  hideDurationMs: number;
}

const promotions: Record<string, Promotion> = {
  'promo-js-2026': {
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    component: JS2026,
    hideDurationMs: dayjs.duration(1, 'week').asMilliseconds()
  },
  'promo-april-2025': {
    startDate: new Date('2025-04-01'),
    endDate: new Date('2028-12-31'),
    component: April2025,
    hideDurationMs: dayjs.duration(1, 'week').asMilliseconds()
  }
};

export const dismissPromotion = (id?: string): void => {
  if (!id || !promotions[id]) {
    return;
  }
  hiddenPromotions.value = {
    ...hiddenPromotions.value,
    [id]: dayjs().add(promotions[id].hideDurationMs).valueOf()
  };
};

const hiddenPromotions = persisted<Record<string, number>>('hiddenPromotions', {});

export const getActivePromotion = (): (Promotion & { id: string }) | undefined => {
  if (!env.isEnabledMermaidChartLinks) {
    return;
  }

  const hidePromotionsUntil = hiddenPromotions.value;
  const now = dayjs();
  const promotionWithID = Object.entries(promotions)
    .filter(
      ([id, p]) =>
        dayjs(p.startDate).isBefore(now) &&
        dayjs(p.endDate).isAfter(now) &&
        (!hidePromotionsUntil[id] || dayjs(hidePromotionsUntil[id]).isBefore(now))
    )
    .sort(([, a], [, b]) => dayjs(b.endDate).diff(dayjs(a.endDate)))
    .pop();

  if (!promotionWithID) {
    return;
  }

  const [id, promotion] = promotionWithID;
  return { ...promotion, id };
};
