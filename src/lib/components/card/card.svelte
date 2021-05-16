<script lang="ts">
	import { slide } from 'svelte/transition';
	import Tabs from './tabs.svelte';
	export let isCloseable: boolean = true;
	export let isOpen: boolean = true;
	export let tabs: Tab[] = [];
	export let title: string;
	$: {
		console.log('a', isOpen);
		isOpen = isCloseable ? isOpen : true;
		console.log(isOpen);
	}
</script>

<div class={`bg-white rounded overflow-hidden shadow m-2 flex-grow flex flex-col `}>
	<div class="bg-indigo-400 border-gray-400 p-2 flex-none" on:click={() => (isOpen = !isOpen)}>
		<div class="flex justify-between">
			<Tabs on:select {tabs} bind:isOpen {title} {isCloseable} />
			<div class="flex gap-x-4 text-white">
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
