<script lang="ts">
  import { TID } from '$/constants';
  import type { PanZoomState } from '$/util/panZoom';
  import { renderAndPlaceDiagram } from '$/util/renderView';
  import FontAwesome, { mayContainFontAwesome } from '$lib/components/FontAwesome.svelte';
  import uniqueID from 'lodash-es/uniqueId';
  import type { MermaidConfig } from 'mermaid';

  // Standalone, props-driven diagram canvas for the /embed widget.
  // Must never import the editor's state singleton: no localStorage, no URL
  // rewriting, no analytics.
  let {
    code,
    config,
    dark = false,
    grid = true,
    pan,
    panZoomState,
    rough = false,
    zoom
  }: {
    code: string;
    config: MermaidConfig;
    dark?: boolean;
    grid?: boolean;
    pan?: { x: number; y: number };
    panZoomState: PanZoomState;
    rough?: boolean;
    zoom?: number;
  } = $props();

  let container: HTMLDivElement | undefined = $state();
  let error = $state<string | undefined>();
  let waitForFontAwesomeToLoad: FontAwesome['waitForFontAwesomeToLoad'] | undefined = $state();

  const renderDiagram = async (
    currentCode: string,
    currentConfig: MermaidConfig,
    currentRough: boolean,
    currentPan: { x: number; y: number } | undefined,
    currentZoom: number | undefined
  ) => {
    if (!container) {
      return;
    }
    try {
      if (mayContainFontAwesome(currentCode)) {
        await waitForFontAwesomeToLoad?.();
      }
      const { graphDiv } = await renderAndPlaceDiagram({
        code: currentCode,
        config: currentConfig,
        container,
        rough: currentRough,
        viewId: uniqueID('embed-graph-')
      });
      if (graphDiv) {
        panZoomState.updateElement(graphDiv, { pan: currentPan, zoom: currentZoom });
      }
      error = undefined;
    } catch (error_) {
      console.error('embed render failed', error_);
      error = error_ instanceof Error ? error_.message : String(error_);
    }
  };

  // Queue renders to avoid racing when code/config change quickly. Each queued
  // render is skipped if a newer one superseded it while it waited (latest wins).
  let pendingRender = Promise.resolve();
  let renderSeq = 0;
  $effect(() => {
    // Read every render input synchronously so prop updates re-trigger the effect.
    const currentCode = code;
    const currentConfig = config;
    const currentRough = rough;
    const currentPan = pan;
    const currentZoom = zoom;
    void container;
    const seq = ++renderSeq;
    pendingRender = pendingRender.then(() => {
      if (seq !== renderSeq) {
        return;
      }
      return renderDiagram(currentCode, currentConfig, currentRough, currentPan, currentZoom);
    });
  });
</script>

<FontAwesome bind:waitForFontAwesomeToLoad />

<div
  id="embed-view"
  class={[
    'h-full w-full',
    grid && (dark ? 'grid-bg-dark' : 'grid-bg-light'),
    error && 'opacity-50'
  ]}>
  <div id="embed-container" bind:this={container} class="h-full overflow-auto"></div>
</div>

{#if error}
  <div
    data-testid={TID.embedRenderError}
    class="pointer-events-none absolute bottom-2 left-2 max-w-[80%] rounded-md border border-red-400 bg-red-50 px-3 py-1.5 font-mono text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
    {error}
  </div>
{/if}

<style>
  .grid-bg-light {
    background-size: 30px 30px;
    background-image: radial-gradient(circle, #e4e4e48c 2px, #0000 2px);
  }

  .grid-bg-dark {
    background-size: 30px 30px;
    background-image: radial-gradient(circle, #46464646 2px, #0000 2px);
  }
</style>
