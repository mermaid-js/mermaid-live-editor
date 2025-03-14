<script lang="ts">
  import { PanZoomState } from '$/util/panZoom';
  import type { State, ValidatedState } from '$lib/types';
  import { recordRenderTime, shouldRefreshView } from '$lib/util/autoSync';
  import { render as renderDiagram } from '$lib/util/mermaid';
  import { inputStateStore, stateStore, updateCodeStore } from '$lib/util/state';
  import { logEvent, saveStatistics } from '$lib/util/stats';
  import { cmdKey } from '$lib/util/util';
  import type { MermaidConfig } from 'mermaid';
  import { mode } from 'mode-watcher';
  import { onMount } from 'svelte';
  import { Svg2Roughjs } from 'svg2roughjs';
  import SyncIcon from '~icons/material-symbols/sync-rounded';

  let {
    panZoomState = new PanZoomState(),
    shouldShowGrid = true
  }: { panZoomState?: PanZoomState; shouldShowGrid?: boolean } = $props();
  let code = '';
  let config = '';
  let container: HTMLDivElement | undefined = $state();
  let rough: boolean;
  let view: HTMLDivElement | undefined = $state();
  let error = $state(false);
  let outOfSync = $state(false);
  let hide = $state(false);
  let manualUpdate = true;

  // Set up panZoom state observer to update the store when pan/zoom changes
  const setupPanZoomObserver = () => {
    panZoomState.onPanZoomChange = (pan, zoom) => {
      updateCodeStore({ pan, zoom });
      logEvent('panZoom');
    };
  };

  const handlePanZoom = (state: State) => {
    if (!state.panZoom) {
      return;
    }
    hide = true;

    void Promise.resolve().then(() => {
      const graphDiv = document.querySelector<SVGElement>('#graph-div');
      if (!graphDiv) {
        return;
      }
      panZoomState.updateElement(graphDiv, state);
      hide = false;
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
        if (code === state.code && config === state.mermaid && rough === state.rough) {
          return;
        }

        if (!shouldRefreshView()) {
          outOfSync = true;
          return;
        }

        code = state.code;
        config = state.mermaid;
        rough = state.rough;
        const scroll = view?.parentElement?.scrollTop;
        delete container.dataset.processed;
        const {
          svg,
          bindFunctions,
          diagramType: detectedDiagramType
        } = await renderDiagram(
          Object.assign({}, JSON.parse(state.mermaid)) as MermaidConfig,
          code,
          'graph-div'
        );
        diagramType = detectedDiagramType;
        if (svg.length > 0) {
          container.innerHTML = svg;
          const graphDiv = document.querySelector<SVGSVGElement>('#graph-div');
          if (!graphDiv) {
            throw new Error('graph-div not found');
          }
          if (state.rough) {
            const svg2roughjs = new Svg2Roughjs('#container');
            svg2roughjs.svg = graphDiv;
            await svg2roughjs.sketch();
            graphDiv.remove();
            const sketch = document.querySelector<HTMLElement>('#container > svg');
            if (!sketch) {
              throw new Error('sketch not found');
            }
            const height = sketch.getAttribute('height');
            const width = sketch.getAttribute('width');
            sketch.setAttribute('id', 'graph-div');
            sketch.setAttribute('height', '100%');
            sketch.setAttribute('width', '100%');
            sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
            sketch.style.maxWidth = '100%';
          } else {
            graphDiv.setAttribute('height', '100%');
            graphDiv.style.maxWidth = '100%';
            if (bindFunctions) {
              bindFunctions(graphDiv);
            }
          }
          handlePanZoom(state);
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
    setupPanZoomObserver();
    stateStore.subscribe((state) => {
      void handleStateChange(state);
    });
  });
</script>

{#if outOfSync}
  <div
    class="bg-base-100 absolute z-10 w-full bg-opacity-80 p-2 text-left font-mono text-yellow-600"
    id="errorContainer">
    Diagram out of sync. <br />
    {#if $stateStore.autoSync}
      It will be updated automatically.
    {:else}
      Press <SyncIcon /> (Sync button) or <kbd>{cmdKey} + Enter</kbd> to sync.
    {/if}
  </div>
{/if}

<div
  id="view"
  bind:this={view}
  class="grid-bg-{shouldShowGrid ? ($mode === 'dark' ? 'dark' : 'light') : 'none'} h-full"
  class:error
  class:outOfSync>
  <div id="container" bind:this={container} class="h-full overflow-auto" class:hide></div>
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

  .grid-bg-light {
    background-size: 30px 30px;
    background-image: radial-gradient(circle, #e4e4e789 2px, rgba(0, 0, 0, 0) 2px);
  }

  .grid-bg-dark {
    background-size: 30px 30px;
    background-image: radial-gradient(circle, #46464646 2px, rgba(0, 0, 0, 0) 2px);
  }
</style>
