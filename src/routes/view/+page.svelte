<script lang="ts">
  import { Button } from '$/components/ui/button';
  import View from '$/components/View.svelte';
  import { urlsStore } from '$/util/state';
  import { initHandler } from '$/util/util';
  import { onMount } from 'svelte';
  import ArrowBackIcon from '~icons/material-symbols/arrow-back-rounded';

  let isLoading = $state(false);
  let loadingTimeout;

  const handleEditClick = () => {
    isLoading = true;

    const editUrl = $urlsStore.edit;
    sessionStorage.setItem('redirectUrl', editUrl);

    setTimeout(() => {
      window.location.href = editUrl;
    }, 400);
  };

  onMount(() => {
    initHandler();

    isLoading = false;
    sessionStorage.removeItem('redirectUrl');

    window.addEventListener('pageshow', (event) => {
      isLoading = false;
      clearTimeout(loadingTimeout);
    });

    return () => {
      clearTimeout(loadingTimeout);
    };
  });

  $effect(() => {
    if (isLoading) {
      clearTimeout(loadingTimeout);
      loadingTimeout = setTimeout(() => {
        isLoading = false;
      }, 4000);
    } else {
      clearTimeout(loadingTimeout);
    }
  });
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
        Đang chuyển hướng...
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
      <div class="text-foreground font-medium">Đang tải trình soạn thảo...</div>
      <div class="text-xs text-muted-foreground">(Loading sẽ tự tắt sau 5 giây)</div>
    </div>
  </div>
{/if}
