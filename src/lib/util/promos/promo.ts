import { writable, type Writable, get } from 'svelte/store';
import { persist, localStorage } from '../persist';
import August2024 from './August2024.svelte';
import { env } from '$lib/util/env';

interface Promotion {
  id: string;
  startDate: Date;
  endDate: Date;
  component: ConstructorOfATypedSvelteComponent;
}

const promotions: Promotion[] = [
  {
    id: 'promo-2024',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-12-31'),
    component: August2024
  }
];

export const dismissPromotion = (id?: string): void => {
  if (!id) {
    return;
  }
  dismissedPromotionsStore.update((dismissedIDs: string[]) => {
    dismissedIDs.push(id);
    return dismissedIDs;
  });
};

const dismissedPromotionsStore: Writable<string[]> = persist(
  writable([]),
  localStorage(),
  'dismissedPromotions'
);

export const getActivePromotion = (): Promotion | undefined => {
  if (!env.isEnabledMermaidChartLinks) {
    return;
  }

  const dismissedPromotions = get(dismissedPromotionsStore);
  const now = new Date();
  return promotions
    .filter(
      (p: Promotion) =>
        p.startDate <= now && p.endDate >= now && !dismissedPromotions.includes(p.id)
    )
    .sort((a: Promotion, b: Promotion) => b.endDate.getTime() - a.endDate.getTime())
    .pop();
};
