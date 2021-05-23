<script lang="ts">
	import type { Tab, TabEvents } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	export let isCloseable = true;
	export let tabs: Tab[] = [];
	export let title: string;
	export let isOpen = false;

	let activeTabID: string = tabs[0]?.id;

	const dispatch = createEventDispatcher<TabEvents>();
	const toggleTabs = (tab: Tab) => {
		activeTabID = tab.id;
		dispatch('select', tab);
	};
</script>

<div class="flex cursor-default">
	<span class="text-white mr-2 font-semibold" on:click|stopPropagation={() => (isOpen = !isOpen)}>
		{#if isCloseable}
			<i class="fas fa-chevron-right icon" class:isOpen />
		{/if}
		{title}</span>
	{#if isOpen && tabs}
		<ul class="flex flex-wrap flex-row" transition:fade>
			{#each tabs as tab}
				<li class="mr-2 last:mr-0 w-28 flex-auto text-center">
					<div
						class="text cursor-pointer font-semibold min-w-16 w-auto px-2 py-1 -mb-4 rounded-t  block leading-normal {activeTabID ===
						tab.id
							? 'text-indigo-500 bg-white border-white'
							: 'text-white bg-indigo-500 border-indigo-500 hover:bg-indigo-600'}"
						on:click|stopPropagation={() => toggleTabs(tab)}>
						<i class={tab.icon} />
						{tab.title}
					</div>
				</li>
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
