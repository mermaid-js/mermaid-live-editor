<script lang="ts">
	import type { Tab, TabEvents } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	export let isCloseable = true;
	export let tabs: Tab[] = [];
	export let title: string;
	export let isOpen = false;

	$: activeTabID = tabs[0]?.id;

	const dispatch = createEventDispatcher<TabEvents>();
	const toggleTabs = (tab: Tab) => {
		activeTabID = tab.id;
		dispatch('select', tab);
	};
</script>

<div class="flex cursor-default">
	<span class="mr-2 font-semibold" on:click|stopPropagation={() => (isOpen = !isOpen)}>
		{#if isCloseable}
			<i class="fas fa-chevron-right icon" class:isOpen />
		{/if}
		{title}</span>
	{#if isOpen && tabs}
		<ul class="tabs" transition:fade>
			{#each tabs as tab}
				<div
					class="tab tab-lifted text-primary-content {activeTabID === tab.id ? 'tab-active' : ''}"
					on:click|stopPropagation={() => toggleTabs(tab)}>
					<i class="mr-1 {tab.icon}" />
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
