<script lang="ts">
	import type { Tab } from '$lib/types';
	import { slide } from 'svelte/transition';
	import Tabs from './tabs.svelte';
	export let isCloseable = true;
	export let isOpen = true;
	export let tabs: Tab[] = [];
	export let title: string;
	$: isOpen = isCloseable ? isOpen : true;
</script>

<div class="bg-white rounded overflow-hidden shadow m-2 flex-grow flex flex-col">
	<div class="bg-indigo-400 border-gray-400 p-2 flex-none" on:click={() => (isOpen = !isOpen)}>
		<div class="flex justify-between">
			<Tabs on:select {tabs} bind:isOpen {title} {isCloseable} />
			<div class="flex gap-x-4 items-center text-white">
				<slot name="actions" />
			</div>
		</div>
	</div>
	{#if isOpen}
		<div class="flex-grow overflow-auto" transition:slide>
			<slot />
		</div>
	{/if}
</div>
