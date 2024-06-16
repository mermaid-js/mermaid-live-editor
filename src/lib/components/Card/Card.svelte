<script lang="ts">
  import type { Tab } from '$lib/types';
  import { slide } from 'svelte/transition';
  import Tabs from './Tabs.svelte';
  export let isCloseable = true;
  export let isOpen = true;
  export let tabs: Tab[] = [];
  export let activeTabID = '';
  export let title: string;
  $: isOpen = isCloseable ? isOpen : true;
  $: isTabsShown = isOpen && tabs.length > 0;
</script>

<div class="card m-2 flex flex-grow flex-col overflow-hidden rounded shadow-2xl">
  <div
    role="toolbar"
    tabindex="0"
    class="bg-primary p-2 {isTabsShown ? 'pb-0' : ''} flex-none cursor-pointer"
    on:click={() => (isOpen = !isOpen)}
    on:keypress={() => (isOpen = !isOpen)}>
    <div class="flex justify-between">
      <Tabs on:select {tabs} bind:isOpen {title} {isCloseable} {activeTabID} />
      <div class="flex items-center gap-x-4 {isTabsShown ? '-mt-2' : ''}">
        <slot name="actions" />
      </div>
    </div>
  </div>
  {#if isOpen}
    <div class="card-body flex-grow overflow-auto p-0 text-base-content" transition:slide>
      <slot />
    </div>
  {/if}
</div>
