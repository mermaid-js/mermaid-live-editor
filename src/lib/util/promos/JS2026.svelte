<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { getCheckoutUrl } from '$/util/util';
  import type { Snippet } from 'svelte';

  interface Props {
    closeBanner: Snippet;
  }

  let { closeBanner }: Props = $props();

  const url = getCheckoutUrl({ utmCampaign: 'oss_coupon', utmMedium: 'banner_ad' });
</script>

<div class="flex w-full items-center bg-[#E0095F] p-1.5" role="banner">
  <div class="grid grow">
    <a
      href={url}
      target="_blank"
      class="col-start-1 row-start-1 flex items-center justify-center gap-4 no-underline">
      <span class="text-base tracking-wider text-white">
        Try Mermaid Advanced Editor — OSS users get 10% off with code JS26
      </span>
      <Button
        class="shrink-0 rounded-md bg-[#1E1A2E] px-3 py-1.5 text-base font-semibold tracking-wide text-white hover:bg-[#261A56]">
        Get started
      </Button>
    </a>
  </div>
  {@render closeBanner()}
</div>
