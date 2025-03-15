<script lang="ts">
  import type { Tab } from '$lib/types';
  import { fade } from 'svelte/transition';

  let {
    isClosable = true,
    tabs,
    title,
    isOpen = $bindable(false),
    activeTabID = $bindable(),
    onselect
  }: {
    isClosable?: boolean;
    tabs: Tab[];
    title: string;
    isOpen?: boolean;
    activeTabID: string;
    onselect?: (tab: Tab) => void;
  } = $props();

  if (!activeTabID && tabs.length > 0) {
    activeTabID = tabs[0].id;
  }

  const toggleTabs = (tab: Tab) => {
    return (event: Event) => {
      event.stopPropagation();
      activeTabID = tab.id;
      onselect?.(tab);
    };
  };
</script>

<div class="flex cursor-default">
  <span role="menubar" tabindex="0" class="mr-2 font-semibold">
    {#if isClosable}
      <i class="fas fa-chevron-right icon mr-1" class:isOpen></i>
    {/if}
    {title}
  </span>
  {#if isOpen && tabs}
    <ul class="tabs" transition:fade>
      {#each tabs as tab}
        <div
          role="tab"
          tabindex="0"
          class="tab tab-lifted {activeTabID === tab.id ? 'tab-active' : 'text-primary-content'}"
          onclick={toggleTabs(tab)}
          onkeypress={toggleTabs(tab)}>
          <i class="mr-1 {tab.icon}"></i>
          {tab.title}
        </div>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .icon {
    transition-duration: 0.5s;
  }
  .isOpen {
    transform: rotate(90deg);
  }
</style>
