<script lang="ts">
  import type { Tab } from '$lib/types';
  import type { Snippet } from 'svelte';
  import { slide } from 'svelte/transition';
  import Tabs from './Tabs.svelte';

  interface Props {
    isClosable?: boolean;
    isOpen?: boolean;
    tabs?: Tab[];
    activeTabID?: string;
    title: string;
    onselect?: (tab: Tab) => void;
    actions?: Snippet;
    children?: Snippet;
  }

  let {
    isClosable = true,
    isOpen = true,
    tabs = [],
    activeTabID = '',
    title,
    onselect,
    actions,
    children
  }: Props = $props();

  const toggleCardOpen = () => {
    if (isClosable) {
      isOpen = !isOpen;
    }
  };

  let isTabsShown = $derived(isOpen && tabs.length > 0);
</script>

<div class="card m-2 flex flex-grow flex-col overflow-hidden rounded shadow-2xl">
  <div
    role="toolbar"
    tabindex="0"
    class="bg-primary p-2 {isTabsShown ? 'pb-0' : ''} flex-none cursor-pointer"
    onclick={toggleCardOpen}
    onkeypress={toggleCardOpen}>
    <div class="flex justify-between">
      <Tabs {onselect} {tabs} bind:isOpen {title} {isClosable} {activeTabID} />
      <div class="flex items-center gap-x-4 {isTabsShown ? '-mt-2' : ''}">
        {@render actions?.()}
      </div>
    </div>
  </div>
  {#if isOpen}
    <div class="card-body flex-grow overflow-auto p-0 text-base-content" transition:slide>
      {@render children?.()}
    </div>
  {/if}
</div>
