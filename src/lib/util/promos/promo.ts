import { env } from '$lib/util/env';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import type { Component } from 'svelte';
import { get, writable, type Writable } from 'svelte/store';
import { localStorage, persist } from '../persist';
import April2025 from './April2025.svelte';

dayjs.extend(duration);

interface Promotion {
  startDate: Date;
  endDate: Date;
  component: Component;
  hideDurationMs: number;
}

const promotions: Record<string, Promotion> = {
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
  hiddenPromotionsStore.update((dismissedIDs) => {
    dismissedIDs[id] = dayjs().add(promotions[id].hideDurationMs).valueOf();
    return dismissedIDs;
  });
};

const hiddenPromotionsStore: Writable<Record<string, number>> = persist(
  writable({}),
  localStorage(),
  'hiddenPromotions'
);

export const getActivePromotion = (): (Promotion & { id: string }) | undefined => {
  if (!env.isEnabledMermaidChartLinks) {
    return;
  }

  const hidePromotionsUntil = get(hiddenPromotionsStore);
  const now = new Date();
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
