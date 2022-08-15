<script lang="ts">
	import { inputStateStore, stateStore, updateCodeStore } from '$lib/util/state';
	import { onMount } from 'svelte';
	import mermaid from 'mermaid';
	import panzoom from 'svg-pan-zoom';
	import type { State } from '$lib/types';
	import { logEvent } from '$lib/util/stats';

	let code = '';
	let config = '';
	let container: HTMLDivElement;
	let view: HTMLDivElement;
	let error = false;
	let outOfSync = false;
	let hide = false;
	let manualUpdate = true;
	let panZoomEnabled = $stateStore.panZoom;
	let pzoom: SvgPanZoom.Instance;
	let debounce: number;

	const handlePanZoomChange = () => {
		const pan = pzoom.getPan();
		const zoom = pzoom.getZoom();
		clearTimeout(debounce);
		debounce = window.setTimeout(() => {
			updateCodeStore({ pan, zoom });
			void logEvent('panZoom');
		}, 200);
	};

	const handlePanZoom = (state: State) => {
		if (!state.panZoom) {
			return;
		}
		hide = true;
		pzoom?.destroy();
		pzoom = undefined;
		Promise.resolve().then(() => {
			const graphDiv = document.getElementById('graph-div');
			pzoom = panzoom(graphDiv, {
				onPan: handlePanZoomChange,
				onZoom: handlePanZoomChange,
				controlIconsEnabled: true,
				fit: true,
				center: true
			});
			const { pan, zoom } = state;
			if (pan !== undefined && zoom !== undefined && Number.isFinite(zoom)) {
				pzoom.zoom(zoom);
				pzoom.pan(pan);
			}
			hide = false;
		});
	};

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
					if (code === state.code && config === state.mermaid && panZoomEnabled === state.panZoom) {
						// Do not render if there is no change in Code/Config/PanZoom
						return;
					}
					code = state.code;
					config = state.mermaid;
					panZoomEnabled = state.panZoom;
					const scroll = view.parentElement.scrollTop;
					delete container.dataset.processed;
					mermaid.initialize(Object.assign({}, JSON.parse(state.mermaid)));
					mermaid.render('graph-div', code, (svgCode) => {
						if (svgCode.length > 0) {
							handlePanZoom(state);
							container.innerHTML = svgCode;
							const graphDiv = document.getElementById('graph-div');
							graphDiv.setAttribute('height', '100%');
							graphDiv.style.maxWidth = '100%';
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
		window.addEventListener('resize', () => {
			if ($stateStore.panZoom && pzoom) {
				pzoom.resize();
			}
		});
	});
</script>

{#if error && $stateStore.error instanceof Error}
	<div class="p-2 text-red-600" id="errorContainer">{$stateStore.error}</div>
{/if}

<div id="view" bind:this={view} class="p-2 h-full" class:error class:outOfSync>
	<div id="container" bind:this={container} class="h-full overflow-auto" class:hide />
</div>

<style>
	#view {
		flex: 1;
	}

	#container {
		transition: visibility 0.3s;
	}

	.error,
	.outOfSync {
		opacity: 0.5;
	}

	.hide {
		visibility: hidden;
	}
</style>
