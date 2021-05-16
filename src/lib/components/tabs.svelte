<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	export let tabs: Tab[] = [];
	export let activeTabID: string = tabs[0].id;
	export let title: string;

	export let isOpen = false;
	const dispatch = createEventDispatcher<TabEvents>();
	const toggleTabs = (tab: Tab) => {
		activeTabID = tab.id;
		dispatch('select', tab);
	};
</script>

<span class="text-white mr-2" on:click={() => (isOpen = !isOpen)}>{title}</span>
{#if isOpen}
	<ul class="flex list-none flex-wrap flex-row" transition:fade>
		{#each tabs as tab}
			<li class="mr-2 last:mr-0 flex-auto text-center">
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					class="text font-bold min-w-16 w-auto px-2 py-1 -mb-4 rounded-t  block leading-normal {activeTabID ===
					tab.id
						? 'text-blue-500 bg-white border-white'
						: 'text-white bg-blue-500 border-blue-500'}"
					on:click={() => toggleTabs(tab)}
				>
					{tab.title}
				</a>
			</li>
		{/each}
	</ul>
{/if}
