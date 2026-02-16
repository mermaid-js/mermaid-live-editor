<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { env } from '$/util/env';
  import type { Snippet } from 'svelte';

  interface Props {
    closeBanner: Snippet;
  }

  let { closeBanner }: Props = $props();

  const utmSource = env.domain === 'mermaid.ai' ? 'mermaid_ai_live' : 'mermaid_live_editor';

  const url = `https://mermaid.ai/app/user/billing/checkout?${new URLSearchParams({
    coupon: 'dmIuNbqx',
    tier: 'plus',
    utm_campaign: 'newyear',
    utm_medium: 'banner_ad',
    utm_source: utmSource
  }).toString()}`;
</script>

<div class="flex w-full items-center bg-[#E0095F] p-1.5" role="banner">
  <div class="grid grow">
    <a
      href={url}
      target="_blank"
      class="col-start-1 row-start-1 flex items-center justify-center gap-4 no-underline">
      <span class="text-base tracking-wider text-white">
        Limited time: 10% off Mermaid Advanced Editor with code NEWYEAR
      </span>
      <Button
        class="shrink-0 rounded-md bg-[#1E1A2E] px-3 py-1.5 text-base font-semibold tracking-wide text-white hover:bg-[#261A56]">
        Claim discount
      </Button>
    </a>
  </div>
  {@render closeBanner()}
</div>
