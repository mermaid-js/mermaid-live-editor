<script lang="ts">
  import { getFlowSignUpUrl } from '#lib/util/util.js';
  import type { Snippet } from 'svelte';

  interface Props {
    closeBanner: Snippet;
  }

  let { closeBanner }: Props = $props();

  const url = getFlowSignUpUrl({ utmCampaign: 'november_flow', utmMedium: 'banner_ad' });
</script>

<div class="flex w-full items-center bg-[#E0095F] p-1.5" role="banner">
  <div class="grid grow">
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      class="col-start-1 row-start-1 flex items-center justify-center gap-4 no-underline">
      <span class="text-base tracking-wider text-white">
        AI workflows you can read, review, and run.
      </span>
      <span
        class="shrink-0 rounded-md bg-[#1E1A2E] px-3 py-1.5 text-base font-semibold tracking-wide text-white hover:bg-[#261A56]">
        Try Mermaid Flow
      </span>
    </a>
  </div>
  {@render closeBanner()}
</div>
