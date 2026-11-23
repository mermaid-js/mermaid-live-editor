import { env } from '#lib/util/env.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import type { Component, Snippet } from 'svelte';
import { persisted } from '../persist.svelte';
import April2025 from './April2025.svelte';
import NovemberFlow from './NovemberFlow.svelte';

dayjs.extend(duration);

interface Promotion {
  startDate: Date;
  endDate: Date;
  component: Component<{ closeBanner: Snippet }>;
  hideDurationMs: number;
}

// The promotion that ends soonest wins, so a short campaign temporarily replaces the regular banner.
const promotions: Record<string, Promotion> = {
  'promo-november-flow': {
    // Pacific time: PST is UTC-8 for the whole campaign.
    startDate: new Date('2026-11-19T00:01:00-08:00'),
    endDate: new Date('2026-12-31T23:59:00-08:00'),
    component: NovemberFlow,
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
