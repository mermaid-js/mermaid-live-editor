<script lang="ts">
  import type { Tab } from '$lib/types';
  import type { Snippet } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { slide } from 'svelte/transition';
  import Tabs from './Tabs.svelte';

  interface Props {
    isClosable?: boolean;
    isOpen?: boolean;
    tabs?: Tab[];
    activeTabID?: string;
    title?: string;
    icon?: string;
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
    icon,
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

<div
  class="card flex h-fit {isOpen
    ? 'flex-grow'
    : ''} w-full flex-col overflow-hidden rounded-2xl border-2">
  <div
    role="toolbar"
    tabindex="0"
    class="bg-border p-2 {isTabsShown ? 'pb-0' : ''} flex-none cursor-pointer"
    onclick={toggleCardOpen}
    onkeypress={toggleCardOpen}>
    <div class="flex justify-between">
      {#if icon || title}
        <span role="menubar" tabindex="0" class="flex w-fit items-center gap-2 font-semibold">
          {#if icon}
            <i class={icon}></i>
          {/if}
          {title}
        </span>
      {/if}
      {#if isOpen && tabs && tabs.length > 0}
        <Tabs {onselect} {tabs} {activeTabID} />
      {/if}

      {@render actions?.()}

      <!-- {#if isClosable && isOpen}
        <div class="ml-auto flex h-8 flex-col gap-0 p-1">
          <i class="fas fa-chevron-down size-full"></i>
          <i class="fas fa-chevron-up size-full"></i>
        </div>
      {/if} -->
    </div>
  </div>
  {#if isOpen}
    <div
      class="text-base-content flex-grow overflow-hidden p-0"
      transition:slide={{ easing: quintOut }}>
      {@render children?.()}
    </div>
  {/if}
</div>
