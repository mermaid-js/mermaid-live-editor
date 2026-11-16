import { persisted } from './persist.svelte';
import { logEvent } from './stats';

// v13 announcement experiment: each browser is randomly assigned one callout
// variant and keeps it, so clicks can be compared per variant.
const variants = ['chip', 'peek', 'pill'] as const;
export type V13Variant = (typeof variants)[number];

const assigned = persisted<string>('v13Variant', '');
if (!(variants as readonly string[]).includes(assigned.value)) {
  assigned.value = variants[Math.floor(Math.random() * variants.length)];
}

// Shared by every variant, so dismissing one dismisses them all.
export const v13 = {
  dismissed: persisted('v13CalloutDismissed', false),
  trackClick: (): void => {
    logEvent('bannerClick', { promotion: `v13-diet-${v13.variant}` });
  },
  url: 'https://mermaid.js.org/intro/v13-alpha',
  variant: assigned.value as V13Variant
};
