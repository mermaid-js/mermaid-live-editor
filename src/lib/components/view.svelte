<script lang="ts">
	import { errorStore } from '$lib/util/error';

	import { codeStore } from '$lib/util/state';
	import { onMount } from 'svelte';
	import type { Mermaid } from 'mermaid';

	const mermaid: Mermaid = (window.mermaid as unknown) as Mermaid;
	let code: string = '';
	let container: HTMLDivElement;
	let error: boolean = false;
	let outOfSync: boolean = false;
	let manualUpdate: boolean = true;
	onMount(async () => {
		codeStore.subscribe((state) => {
			try {
				if (container && state && (state.updateDiagram || state.autoSync)) {
					if (!state.autoSync) {
						$codeStore.updateDiagram = false;
					}
					outOfSync = false;
					manualUpdate = true;
					// Replacing special characters '<' and '>' with encoded '&lt;' and '&gt;'
					code = state.code; //.replace(/</g, '&lt;').replace(/>/g, '&gt;');
					const scroll = container.parentElement.parentElement.parentElement.scrollTop;
					container.innerHTML = code;
					delete container.dataset.processed;
					mermaid.initialize(Object.assign({}, JSON.parse(state.mermaid)));
					mermaid.init(container);
					mermaid.render('graph-div', code, insertSvg);
					container.parentElement.parentElement.parentElement.scrollTop = scroll;
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
	const insertSvg = (svgCode, bindFunctions) => {};
</script>

<div id="view" class="p-4" class:error class:outOfSync>
	<div id="container" bind:this={container} class="flex-grow overflow-auto" />
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
