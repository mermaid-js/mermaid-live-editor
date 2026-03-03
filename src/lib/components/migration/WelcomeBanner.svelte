<script lang="ts">
  import { Button } from '$/components/ui/button';
  import {
    dismissWelcomeBanner,
    incrementWelcomeBannerVisitCount,
    redirectToMermaidLive
  } from '$/util/migration/domainMigration';
  import { logEvent } from '$/util/stats';
  import { onMount } from 'svelte';
  import CloseIcon from '~icons/material-symbols/close-rounded';
  import SwapIcon from '~icons/material-symbols/swap-horiz-rounded';
  import WhyWeMovedModal from './WhyWeMovedModal.svelte';

  let visible = $state(true);
  let showExplainer = $state(false);

  onMount(() => {
    incrementWelcomeBannerVisitCount();
  });

  const handleContinue = () => {
    logEvent('bannerDismissed');
    dismissWelcomeBanner();
    visible = false;
  };

  const handleClose = () => {
    // Just dismiss for this session, don't set permanent dismissal
    logEvent('bannerDismissed');
    visible = false;
  };

  const handleGoBack = () => {
    redirectToMermaidLive();
  };

  const handleWhyDidWeMove = () => {
    logEvent('explainerOpened');
    showExplainer = true;
  };
</script>

{#if visible}
  <div
    class="relative mb-2 flex w-full flex-col items-center gap-3 border-b bg-pink-100 px-4 py-3 sm:flex-row sm:gap-4"
    role="banner">
    <div class="flex flex-1 flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
      <SwapIcon class="hidden size-5 shrink-0 text-accent sm:block" />
      <div>
        <span class="font-medium">Mermaid Live Editor has a new home</span>
        <span class="hidden text-sm text-muted-foreground sm:inline">
          Same open-source editor, your diagrams stay client-side.
        </span>
        <button
          type="button"
          class="ml-1 text-sm text-blue-500 underline hover:text-blue-400"
          onclick={handleWhyDidWeMove}>
          Why did we move?
        </button>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <Button variant="accent" size="sm" onclick={handleContinue}>Continue here</Button>
      <span class="text-sm text-muted-foreground">or</span>
      <button
        type="button"
        class="text-sm text-blue-500 underline hover:text-blue-400"
        onclick={handleGoBack}>
        go back to mermaid.live
      </button>
    </div>

    <button
      type="button"
      class="absolute top-2 right-2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground sm:static sm:ml-2"
      onclick={handleClose}
      title="Dismiss">
      <CloseIcon class="size-4" />
    </button>
  </div>
{/if}

<WhyWeMovedModal bind:open={showExplainer} onOpenChange={(v) => (showExplainer = v)} />
