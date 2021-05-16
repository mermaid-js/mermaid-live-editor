<script lang="ts">
	import { slide } from 'svelte/transition';
	export let isOpen: boolean = true;
</script>

<div class={`bg-white rounded overflow-hidden shadow m-2 flex-grow flex flex-col `}>
	<div class="bg-blue-400 border-gray-400 p-2 flex-none">
		<slot name="title" />
	</div>
	{#if isOpen}
		<div class="flex-grow overflow-auto" transition:slide>
			<slot />
		</div>
	{/if}
</div>
