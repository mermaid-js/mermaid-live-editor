<script lang="ts">
	import { inputStateStore, stateStore } from '$lib/util/state';
	import { onMount } from 'svelte';
	import mermaid from 'mermaid';

	let code = '';
	let config = '';
	let container: HTMLDivElement;
	let view: HTMLDivElement;
	let error = false;
	let outOfSync = false;
	let manualUpdate = true;
	onMount(() => {
		stateStore.subscribe((state) => {
			if (state.error !== undefined) {
				error = true;
				return;
			}
			error = false;
			try {
				if (container && state && (state.updateDiagram || state.autoSync)) {
					if (!state.autoSync) {
						$inputStateStore.updateDiagram = false;
					}
					outOfSync = false;
					manualUpdate = true;
					if (code === state.code && config === state.mermaid) {
						// Do not render if there is no change in Code/Config
						return;
					}
					code = state.code;
					config = state.mermaid;
					const scroll = view.parentElement.scrollTop;
					delete container.dataset.processed;
					mermaid.initialize(Object.assign({}, JSON.parse(state.mermaid)));
					mermaid.render('graph-div', code, (svgCode) => {
						if (svgCode.length > 0) {
							console.log(svgCode);
							container.innerHTML = svgCode;
						}
					});
					view.parentElement.scrollTop = scroll;
					error = false;
				} else if (manualUpdate) {
					manualUpdate = false;
				} else {
					outOfSync = true;
				}
			} catch (e) {
				console.log('view fail', e);
				error = true;
			}
		});
	});
</script>

{#if error && $stateStore.error instanceof Error}
	<div class="p-2 text-red-600" id="errorContainer">{$stateStore.error}</div>
{/if}

<div id="view" bind:this={view} class="p-2" class:error class:outOfSync>
	<div id="container" bind:this={container} class="flex-1 overflow-auto" />
</div>

<style>
	#view {
		flex: 1;
	}
	.error,
	.outOfSync {
		opacity: 0.5;
	}
</style>
