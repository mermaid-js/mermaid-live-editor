<script lang="ts">
	import { inputStateStore, stateStore } from '$lib/util/state';
	import { onMount } from 'svelte';
	import mermaid from 'mermaid';
	import panzoom from 'svg-pan-zoom';

	let code = '';
	let config = '';
	let container: HTMLDivElement;
	let view: HTMLDivElement;
	let error = false;
	let outOfSync = false;
	let hide = false;
	let manualUpdate = true;
	let pan: SvgPanZoom.Point;
	let zoom: number;
	let pzoom: SvgPanZoom.Instance;
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
							let oldPan = pan ? { ...pan } : undefined;
							let oldZoom = zoom;
							pzoom?.destroy();
							hide = true;
							container.innerHTML = svgCode;
							setTimeout(() => {
								pzoom = panzoom('#graph-div', {
									onPan: (p) => {
										pan = p;
										zoom = pzoom.getZoom();
									},
									onZoom: (z) => {
										zoom = z;
										pan = pzoom.getPan();
									},
									zoomEnabled: true,
									panEnabled: true,
									controlIconsEnabled: true
								});
								if (oldPan !== undefined && oldZoom !== undefined) {
									pzoom.zoom(oldZoom);
									pzoom.pan(oldPan);
								}
								hide = false;
							}, 0);
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
	<div id="container" bind:this={container} class="flex-1 overflow-auto" class:hide />
</div>

<style>
	#view {
		flex: 1;
	}
	.error,
	.outOfSync {
		opacity: 0.5;
	}

	.hide {
		opacity: 0;
	}
</style>
