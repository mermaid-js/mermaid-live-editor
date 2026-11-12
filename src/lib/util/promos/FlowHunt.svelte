<script lang="ts">
  import { getFlowProductUrl } from '#lib/util/util.js';
  import type { Snippet } from 'svelte';
  import ArrowIcon from '~icons/material-symbols/arrow-forward-rounded';
  import {
    FLOW_HUNT_LAUNCH_URL,
    FLOW_HUNT_UTM,
    flowHuntBanners,
    type FlowHuntPhase
  } from './flowHunt';

  interface Props {
    closeBanner: Snippet;
    phase: FlowHuntPhase;
  }

  let { closeBanner, phase }: Props = $props();

  const banner = $derived(flowHuntBanners[phase]);
  const href = $derived(
    phase === 'launch' ? FLOW_HUNT_LAUNCH_URL : getFlowProductUrl(FLOW_HUNT_UTM)
  );
</script>

<div
  class="flex w-full items-center bg-[#ff6154] p-1.5 text-white"
  role="banner"
  data-testid="flow-hunt-banner"
  data-phase={phase}>
  <div class="grid grow">
    <a
      {href}
      target="_blank"
      rel="noopener noreferrer"
      class="col-start-1 row-start-1 flex items-center justify-center gap-3 no-underline">
      <svg class="hidden size-6 shrink-0 sm:block" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="20" fill="#fff" />
        <path
          fill="#ff6154"
          d="M22.667 20H17v-6h5.667a3 3 0 0 1 0 6m0-10H13v20h4v-6h5.667a7 7 0 1 0 0-14" />
      </svg>
      <span class="text-base tracking-wide text-white">
        <span class="font-semibold">{banner.headline}</span>
        <span class="hidden lg:inline">{banner.tagline}</span>
      </span>
      <span
        class="flex shrink-0 items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-base font-semibold tracking-wide text-[#ff6154] hover:bg-white/90">
        {banner.cta}
        <ArrowIcon class="size-4" aria-hidden="true" />
      </span>
    </a>
  </div>
  {@render closeBanner()}
</div>
