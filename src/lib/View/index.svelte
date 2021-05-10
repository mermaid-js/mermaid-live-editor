<script lang="ts">
	import { errorStore } from '$lib/Util/error';
	import { getMermaid } from '$lib/Util/mermaid';

	import { codeStore } from '$lib/Util/state';
	import { onMount } from 'svelte';
	let container;

	export let code = '';
	export let errorClass = '';
	onMount(async () => {
		const mermaid = await getMermaid();
		codeStore.subscribe((state) => {
			try {
				if (container && state) {
					// Replacing special characters '<' and '>' with encoded '&lt;' and '&gt;'
					code = state.code; //.replace(/</g, '&lt;').replace(/>/g, '&gt;');

					container.innerHTML = code;
					delete container.dataset.processed;
					mermaid.initialize(Object.assign({}, state.mermaid));
					mermaid.init(undefined, container);
					mermaid.render('graph-div', code, insertSvg);
				}
			} catch (e) {
				console.log('view fail', e);
				errorClass = 'error';
			}
		});
		errorStore.subscribe((error) => {
			if (typeof error === 'undefined') {
				errorClass = '';
			} else {
				errorClass = 'error';
				console.log('Error: ', error);
			}
		});
	});
	let insertSvg = function (svgCode, bindFunctions) {};
</script>

<div id="view" class={`p-4 ${errorClass}`}>
	<div bind:this={container} class="flex-grow overflow-auto" />
</div>

<style>
	#view {
		border: 1px solor darkred;
		flex: 1;
	}
	.error {
		opacity: 0.5;
	}
</style>
