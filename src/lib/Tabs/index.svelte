<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let tabs: Tab[] = [];
	export let activeTabID: string = tabs[0].id;
	const dispatch = createEventDispatcher<TabEvents>();
	const toggleTabs = (tab: Tab) => {
		activeTabID = tab.id;
		dispatch('select', tab);
	};
</script>

<div class="flex gap-2">
	<ul class="flex mb-0 list-none flex-wrap flex-row">
		{#each tabs as tab}
			<li class="-mb-2 mr-2 last:mr-0 flex-auto text-center">
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					class="text-xs font-bold w-16 py-1 shadow-lg rounded-t block leading-normal {activeTabID ===
					tab.id
						? 'text-blue-500 bg-white'
						: 'text-white bg-blue-500'}"
					on:click={() => toggleTabs(tab)}
				>
					{tab.title}
				</a>
			</li>
		{/each}
	</ul>
</div>
