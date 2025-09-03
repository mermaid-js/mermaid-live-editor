<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { Separator } from '$/components/ui/separator';
  import type { Tab } from '$lib/types';
  import { fade } from 'svelte/transition';

  let {
    tabs,
    activeTabID,
    onselect
  }: {
    tabs: Tab[];
    activeTabID: string;
    onselect?: (tab: Tab) => void;
  } = $props();

  if (!activeTabID && tabs.length > 0) {
    activeTabID = tabs[0].id;
  }

  const toggleTabs = (tab: Tab) => {
    return (event: Event) => {
      event.stopPropagation();
      onselect?.(tab);
    };
  };
</script>

<div class="flex w-fit cursor-default items-center gap-2">
  <ul class="flex gap-2 align-middle" transition:fade>
    {#each tabs as tab, index (tab.id)}
      <Button
        role="tab"
        variant="ghost"
        class={[
          'px-2',
          activeTabID === tab.id && 'rounded-b-none border-b-2 border-b-primary-foreground/50'
        ]}
        onclick={toggleTabs(tab)}
        onkeypress={toggleTabs(tab)}>
        <tab.icon />
        {tab.title}
      </Button>

      {#if index < tabs.length - 1}
        <div class="my-2">
          <Separator orientation="vertical" class="w-0.5 bg-slate-300" />
        </div>
      {/if}
    {/each}
  </ul>
</div>
