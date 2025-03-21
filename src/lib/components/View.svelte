<script lang="ts">
  import type { State, ValidatedState } from '$lib/types';
  import { recordRenderTime, shouldRefreshView } from '$lib/util/autoSync';
  import { render as renderDiagram } from '$lib/util/mermaid';
  import { inputStateStore, stateStore, updateCodeStore } from '$lib/util/state';
  import { logEvent, saveStatistics } from '$lib/util/stats';
  import { cmdKey } from '$lib/util/util';
  import uniqueID from 'lodash-es/uniqueId';
  import type { MermaidConfig } from 'mermaid';
  import { onMount } from 'svelte';
  import panzoom from 'svg-pan-zoom';
  import { Svg2Roughjs } from 'svg2roughjs';

  let code = '';
  let config = '';
  let container: HTMLDivElement | undefined = $state();
  let rough: boolean;
  let view: HTMLDivElement | undefined = $state();
  let error = $state(false);
  let outOfSync = $state(false);
  let manualUpdate = true;
  let panZoomEnabled = $stateStore.panZoom;
  let pzoom: typeof panzoom | undefined;
  const handlePanZoomChange = () => {
    if (!pzoom) {
      return;
    }
    const pan = pzoom.getPan();
    const zoom = pzoom.getZoom();
    updateCodeStore({ pan, zoom });
    logEvent('panZoom');
  };

  const handlePanZoom = (state: State, graphDiv: SVGSVGElement) => {
    if (!state.panZoom) {
      return;
    }
    pzoom?.destroy();
    pzoom = undefined;
    void Promise.resolve().then(() => {
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
    });
  };

  const handleStateChange = async (state: ValidatedState) => {
    const startTime = Date.now();
    if (state.error !== undefined) {
      error = true;
      return;
    }
    error = false;
    let diagramType: string | undefined;
    try {
      if (container && state && (state.updateDiagram || state.autoSync)) {
        if (!state.autoSync) {
          $inputStateStore.updateDiagram = false;
        }
        outOfSync = false;
        manualUpdate = true;
        // Do not render if there is no change in Code/Config/PanZoom
        if (
          code === state.code &&
          config === state.mermaid &&
          panZoomEnabled === state.panZoom &&
          rough === state.rough
        ) {
          return;
        }

        if (!shouldRefreshView()) {
          outOfSync = true;
          return;
        }

        code = state.code;
        config = state.mermaid;
        panZoomEnabled = state.panZoom;
        rough = state.rough;
        const scroll = view?.parentElement?.scrollTop;
        delete container.dataset.processed;
        const viewID = uniqueID('graph-');
        const {
          svg,
          bindFunctions,
          diagramType: detectedDiagramType
        } = await renderDiagram(JSON.parse(state.mermaid) as MermaidConfig, code, viewID);
        diagramType = detectedDiagramType;
        if (svg.length > 0) {
          container.innerHTML = svg;
          let graphDiv = document.querySelector<SVGSVGElement>(`#${viewID}`);
          if (!graphDiv) {
            throw new Error('graph-div not found');
          }
          if (state.rough) {
            const svg2roughjs = new Svg2Roughjs('#container');
            svg2roughjs.svg = graphDiv;
            await svg2roughjs.sketch();
            graphDiv.remove();
            const sketch = document.querySelector<SVGSVGElement>('#container > svg');
            if (!sketch) {
              throw new Error('sketch not found');
            }
            const height = sketch.getAttribute('height');
            const width = sketch.getAttribute('width');
            sketch.setAttribute('height', '100%');
            sketch.setAttribute('width', '100%');
            sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
            sketch.style.maxWidth = '100%';
            graphDiv = sketch;
          } else {
            graphDiv.setAttribute('height', '100%');
            graphDiv.style.maxWidth = '100%';
            if (bindFunctions) {
              bindFunctions(graphDiv);
            }
          }
          handlePanZoom(state, graphDiv);
        }
        if (view?.parentElement && scroll) {
          view.parentElement.scrollTop = scroll;
        }
        error = false;
      } else if (manualUpdate) {
        manualUpdate = false;
      } else if (code !== state.code || config !== state.mermaid) {
        outOfSync = true;
      }
    } catch (error_) {
      console.error('view fail', error_);
      error = true;
    }
    const renderTime = Date.now() - startTime;
    saveStatistics({ code, renderTime, isRough: state.rough, diagramType });
    recordRenderTime(renderTime, () => {
      $inputStateStore.updateDiagram = true;
    });
  };

  onMount(() => {
    // Queue state changes to avoid race condition
    let pendingStateChange = Promise.resolve();
    stateStore.subscribe((state) => {
      pendingStateChange = pendingStateChange.then(() => handleStateChange(state).catch(() => {}));
    });
    window.addEventListener('resize', () => {
      if ($stateStore.panZoom && pzoom) {
        pzoom.resize();
      }
    });
  });
</script>

{#if outOfSync}
  <div
    class="absolute z-10 w-full bg-base-100 bg-opacity-80 p-2 text-left font-mono text-yellow-600"
    id="errorContainer">
    Diagram out of sync. <br />
    {#if $stateStore.autoSync}
      It will be updated automatically.
    {:else}
      Press <i class="fas fa-sync"></i> (Sync button) or <kbd>{cmdKey} + Enter</kbd> to sync.
    {/if}
  </div>
{/if}

<div id="view" bind:this={view} class="h-full p-2" class:error class:outOfSync>
  <div id="container" bind:this={container} class="h-full overflow-auto"></div>
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
