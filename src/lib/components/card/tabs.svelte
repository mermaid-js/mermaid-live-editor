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

<style>
	.isOpen {
		transform: rotate(-90deg);
		transition-duration: 0.5s;
	}
</style>

<div class="flex cursor-default">
	<span class="text-white mr-2 font-semibold" on:click|stopPropagation={() => (isOpen = !isOpen)}>
		{#if isCloseable}
			<svg
				class="inline"
				class:isOpen
				xmlns="http://www.w3.org/2000/svg"
				width="12"
				height="7"
				viewBox="0 0 12 7"
				><defs
					><style>
						.cls-1 {
							fill: #fff;
							fill-rule: evenodd;
						}
					</style></defs
				><path
					class="cls-1"
					d="M10.38.45,6,4.83,1.56.39h0A.84.84,0,0,0,.38,1.57h0l5,5h0a.83.83,0,0,0,.6.26H6a.83.83,0,0,0,.6-.26h0l5-5h0A.84.84,0,1,0,10.38.45Z" /></svg>
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
