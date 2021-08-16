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

<div class="card rounded overflow-hidden m-2 flex-grow flex flex-col shadow-2xl">
	<div
		class="bg-primary p-2 {tabs.length > 0 ? 'pb-0' : ''} flex-none cursor-pointer"
		on:click={() => (isOpen = !isOpen)}>
		<div class="flex justify-between">
			<Tabs on:select {tabs} bind:isOpen {title} {isCloseable} />
			<div class="flex gap-x-4 items-center">
				<slot name="actions" />
			</div>
		</div>
	</div>
	{#if isOpen}
		<div class="card-body p-0 flex-grow overflow-auto" transition:slide>
			<slot />
		</div>
	{/if}
</div>
