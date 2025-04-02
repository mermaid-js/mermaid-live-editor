<script lang="ts">
  import { Button } from '$/components/ui/button';
  import View from '$/components/View.svelte';
  import { urlsStore } from '$/util/state';
  import { initHandler } from '$/util/util';
  import { onMount } from 'svelte';
  import ArrowBackIcon from '~icons/material-symbols/arrow-back-rounded';
  onMount(initHandler);
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="relative h-full">
  <div class="absolute left-4 top-4 z-50">
    <Button href={$urlsStore.edit} class="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
      <ArrowBackIcon />
      Back to Edit
    </Button>
  </div>
  <View shouldShowGrid={false} />
</div>