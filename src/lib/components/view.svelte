<script lang="ts">
	import { errorStore } from '$lib/util/error';

	import { codeStore } from '$lib/util/state';
	import { onMount } from 'svelte';
	import type { Mermaid } from 'mermaid';

	const mermaid: Mermaid = window.mermaid as unknown as Mermaid;
	let code = '';
	let container: HTMLDivElement;
	let error = false;
	let outOfSync = false;
	let manualUpdate = true;
	onMount(() => {
		codeStore.subscribe((state) => {
			try {
				if (container && state && (state.updateDiagram || state.autoSync)) {
					if (!state.autoSync) {
						$codeStore.updateDiagram = false;
					}
					outOfSync = false;
					manualUpdate = true;
					code = state.code;
					const scroll = container.parentElement.parentElement.parentElement.scrollTop;
					delete container.dataset.processed;
					mermaid.initialize(Object.assign({}, JSON.parse(state.mermaid)));
					mermaid.render('graph-div', code, (svgCode) => {
						container.innerHTML = svgCode;
					});
					container.parentElement.parentElement.parentElement.scrollTop = scroll;
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
		errorStore.subscribe((err) => {
			if (typeof err === 'undefined') {
				error = false;
			} else {
				error = true;
				console.log('Error: ', err);
			}
		});
	});
</script>

<div id="view" class="p-2" class:error class:outOfSync>
	<div id="container" bind:this={container} class="flex-1 overflow-auto" />
</div>

<style>
	#view {
		border: 1px solor darkred;
		flex: 1;
	}
	.error,
	.outOfSync {
		opacity: 0.5;
	}
</style>
