export type FlowHuntPhase = 'pre-launch' | 'launch';

// Product Hunt days run on Pacific time; November 18th 2026 is PST (UTC-8).
export const FLOW_HUNT_LAUNCH_START = new Date('2026-11-18T00:01:00-08:00');
export const FLOW_HUNT_LAUNCH_END = new Date('2026-11-18T23:59:00-08:00');

export const FLOW_HUNT_LAUNCH_URL =
  'https://www.producthunt.com/products/mermaid-chart?launch=mermaid-flow';

export const FLOW_HUNT_UTM = { utmCampaign: 'flow_hunt', utmMedium: 'banner_ad' } as const;

const tagline = 'Build it once, run it the same way every time.';

export const flowHuntBanners: Record<
  FlowHuntPhase,
  { headline: string; tagline: string; cta: string }
> = {
  'pre-launch': {
    headline: 'Mermaid Flow launches on Product Hunt November 18th.',
    tagline,
    cta: 'Learn more'
  },
  launch: {
    headline: 'Mermaid Flow is live on Product Hunt.',
    tagline,
    cta: 'See the launch'
  }
};
