<script lang="ts">
  import { Button } from '$/components/ui/button';
  import View from '$/components/View.svelte';
  import { urlsStore } from '$/util/state';
  import { initHandler } from '$/util/util';
  import { onMount } from 'svelte';
  import ArrowBackIcon from '~icons/material-symbols/arrow-back-rounded';

  let isLoading = $state(false);

  const handleEditClick = () => {
    isLoading = true;
    setTimeout(() => {
      window.location.href = $urlsStore.edit;
    }, 300);
  };

  onMount(initHandler);
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="relative h-full">
  <div class="absolute left-4 top-4 z-50">
    <Button
      onclick={handleEditClick}
      disabled={isLoading}
      class="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
      {#if isLoading}
        <div
          class="animate-spin size-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full">
        </div>
        Redirecting...
      {:else}
        <ArrowBackIcon />
        Back to Edit
      {/if}
    </Button>
  </div>
  <View shouldShowGrid={false} />
</div>

{#if isLoading}
  <div
    class="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="flex flex-col items-center gap-3 p-6 rounded-lg bg-background shadow-lg">
      <div class="animate-spin size-10 border-4 border-primary/30 border-t-primary rounded-full">
      </div>
      <div class="text-foreground font-medium">Loading editor...</div>
    </div>
  </div>
{/if}
