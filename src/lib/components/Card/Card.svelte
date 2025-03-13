<script lang="ts">
  import type { Tab } from '$lib/types';
  import type { Component, Snippet } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { slide } from 'svelte/transition';
  import Tabs from './Tabs.svelte';

  interface Props {
    isClosable?: boolean;
    isOpen?: boolean;
    isStackable?: boolean;
    tabs?: Tab[];
    activeTabID?: string;
    title?: string;
    icon?: Component;
    onselect?: (tab: Tab) => void;
    actions?: Snippet;
    children?: Snippet;
  }

  let {
    isClosable = true,
    isOpen = false,
    isStackable = false,
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
  class="card flex h-fit {isOpen ? 'isOpen flex-grow' : ''} {isStackable
    ? 'flex-1 group-has-[.isOpen]:w-full group-has-[.isOpen]:flex-none'
    : 'w-full'} flex-col overflow-hidden rounded-2xl border-2 border-muted">
  <div
    role="toolbar"
    tabindex="0"
    class="bg-muted p-2 {isTabsShown ? 'pb-1' : ''} flex-none cursor-pointer"
    onclick={toggleCardOpen}
    onkeypress={toggleCardOpen}>
    <div class="flex justify-between whitespace-nowrap">
      {#if icon || title}
        <span role="menubar" tabindex="0" class="flex w-fit items-center gap-2 font-semibold">
          <svelte:component this={icon} class="size-4" />
          {title}
        </span>
      {/if}
      {#if isOpen && tabs && tabs.length > 0}
        <Tabs {onselect} {tabs} {activeTabID} />
      {/if}

      {@render actions?.()}

      <!-- {#if isClosable && isOpen}
        <div class="ml-auto flex h-8 flex-col gap-0 p-1">
          <ChevronDownIcon class="size-full" />
          <ChevronUpIcon class="size-full" />
        </div>
      {/if} -->
    </div>
  </div>
  {#if isOpen}
    <div class="flex-grow overflow-x-auto" transition:slide={{ easing: quintOut }}>
      {@render children?.()}
    </div>
  {/if}
</div>
