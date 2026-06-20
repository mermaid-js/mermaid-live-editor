<script lang="ts">
  import FontAwesome, { mayContainFontAwesome } from '$/components/FontAwesome.svelte';
  import { Button } from '$/components/ui/button';
  import { Separator } from '$/components/ui/separator';
  import { render as renderDiagram } from '$/util/mermaid';
  import { validatedState } from '$/util/state.svelte';
  import { visualEditor } from '$/util/visualEditor/visualEditorState.svelte';
  import uniqueID from 'lodash-es/uniqueId';
  import type { MermaidConfig } from 'mermaid';
  import { mode } from 'mode-watcher';
  import { onDestroy } from 'svelte';
  import panzoom from 'svg-pan-zoom';
  import AddNodeIcon from '~icons/material-symbols/add-box-outline-rounded';
  import AddGroupIcon from '~icons/material-symbols/add-to-photos-outline-rounded';
  import ResetIcon from '~icons/material-symbols/screenshot-frame-2';
  import ZoomInIcon from '~icons/material-symbols/zoom-in';
  import ZoomOutIcon from '~icons/material-symbols/zoom-out';
  import NodeInspector from './NodeInspector.svelte';

  let { shouldShowGrid = true }: { shouldShowGrid?: boolean } = $props();

  let container: HTMLDivElement | undefined = $state();
  let graphDiv: SVGSVGElement | undefined;
  let currentViewId = '';
  let pz: ReturnType<typeof panzoom> | undefined;
  let savedView: { pan: { x: number; y: number }; zoom: number } | undefined;

  let renderError = $state(false);
  let waitForFontAwesomeToLoad: FontAwesome['waitForFontAwesomeToLoad'] | undefined = $state();

  let clusterEntries: { id: string; el: SVGGElement }[] = [];
  let edgeEntries: { index: number; el: SVGPathElement }[] = [];

  // Drag gesture tracking.
  interface Gesture {
    kind: 'node' | 'background';
    id?: string;
    x: number;
    y: number;
    moved: boolean;
  }
  let gesture: Gesture | undefined;
  let ghost = $state<{ x: number; y: number; label: string; action?: string } | undefined>(
    undefined
  );
  let dropTarget: SVGGElement | undefined;
  let edgeTarget: { index: number; el: SVGPathElement } | undefined;

  const DRAG_THRESHOLD = 4;
  // How close (px) the cursor must be to a connector to splice the node into it.
  const EDGE_SNAP = 26;

  const directions = [
    { value: 'TB', label: 'Top→Bottom' },
    { value: 'LR', label: 'Left→Right' },
    { value: 'BT', label: 'Bottom→Top' },
    { value: 'RL', label: 'Right→Left' }
  ];

  // Rendered ids are prefixed with the render's view id: nodes are
  // `<viewId>-flowchart-<id>-<n>` and clusters are `<viewId>-<subgraphId>`.
  const stripViewId = (raw: string): string =>
    currentViewId && raw.startsWith(`${currentViewId}-`)
      ? raw.slice(currentViewId.length + 1)
      : raw;

  const nodeIdFromEl = (el: Element): string | undefined => {
    const model = visualEditor.model;
    if (!model) {
      return undefined;
    }
    const match = /^flowchart-(.+)-\d+$/.exec(stripViewId(el.id));
    const id = match?.[1];
    return id && model.nodes.some((n) => n.id === id) ? id : undefined;
  };

  const subgraphIdFromEl = (el: Element): string | undefined => {
    const model = visualEditor.model;
    if (!model) {
      return undefined;
    }
    const id = stripViewId(el.id);
    return model.subgraphs.some((s) => s.id === id) ? id : undefined;
  };

  const clusterAt = (x: number, y: number): { id: string; el: SVGGElement } | undefined => {
    let best: { id: string; el: SVGGElement; area: number } | undefined;
    for (const entry of clusterEntries) {
      const rect = entry.el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const area = rect.width * rect.height;
        if (!best || area < best.area) {
          best = { ...entry, area };
        }
      }
    }
    return best && { id: best.id, el: best.el };
  };

  const setDropTarget = (el: SVGGElement | undefined) => {
    if (dropTarget === el) {
      return;
    }
    dropTarget?.classList.remove('ve-drop-target');
    el?.classList.add('ve-drop-target');
    dropTarget = el;
  };

  const setEdgeTarget = (entry: { index: number; el: SVGPathElement } | undefined) => {
    if (edgeTarget?.el === entry?.el) {
      return;
    }
    edgeTarget?.el.classList.remove('ve-edge-target');
    entry?.el.classList.add('ve-edge-target');
    edgeTarget = entry;
  };

  // Shortest screen-space distance from the cursor to a rendered connector,
  // sampling points along the path and mapping them through its screen matrix.
  const screenDistanceToPath = (path: SVGPathElement, x: number, y: number): number => {
    const length = path.getTotalLength?.() ?? 0;
    const ctm = path.getScreenCTM();
    if (!length || !ctm) {
      return Number.POSITIVE_INFINITY;
    }
    const samples = Math.min(24, Math.max(4, Math.round(length / 15)));
    let min = Number.POSITIVE_INFINITY;
    for (let i = 0; i <= samples; i++) {
      const point = path.getPointAtLength((length * i) / samples).matrixTransform(ctm);
      min = Math.min(min, Math.hypot(point.x - x, point.y - y));
    }
    return min;
  };

  // Nearest connector to the cursor, ignoring edges already touching `excludeId`.
  const nearestEdge = (x: number, y: number, excludeId: string) => {
    let best: { index: number; el: SVGPathElement } | undefined;
    let bestDistance = EDGE_SNAP;
    for (const entry of edgeEntries) {
      const edge = visualEditor.model?.edges[entry.index];
      if (!edge || edge.start === excludeId || edge.end === excludeId) {
        continue;
      }
      const distance = screenDistanceToPath(entry.el, x, y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = entry;
      }
    }
    return best;
  };

  const applySelection = () => {
    if (!graphDiv) {
      return;
    }
    for (const el of graphDiv.querySelectorAll('.ve-selected')) {
      el.classList.remove('ve-selected');
    }
    const id = visualEditor.selectedId;
    if (id) {
      graphDiv.querySelector(`[data-ve-id="${CSS.escape(id)}"]`)?.classList.add('ve-selected');
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!gesture) {
      return;
    }
    if (
      !gesture.moved &&
      Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < DRAG_THRESHOLD
    ) {
      return;
    }
    gesture.moved = true;
    if (gesture.kind === 'node' && gesture.id) {
      const gestureId = gesture.id;
      const node = visualEditor.nodes.find((n) => n.id === gestureId);
      // Inserting into a connector takes priority over changing group membership.
      const edge = nearestEdge(event.clientX, event.clientY, gestureId);
      setEdgeTarget(edge);
      let action: string | undefined;
      if (edge) {
        setDropTarget(undefined);
        const target = visualEditor.model?.edges[edge.index];
        action = target ? `Insert into ${target.start} → ${target.end}` : 'Insert into connector';
      } else {
        const cluster = clusterAt(event.clientX, event.clientY);
        setDropTarget(cluster?.el);
        if (cluster && cluster.id !== node?.subgraph) {
          action = `Move to ${cluster.id}`;
        }
      }
      ghost = { x: event.clientX, y: event.clientY, label: node?.label || gestureId, action };
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    const current = gesture;
    const droppedEdge = edgeTarget;
    gesture = undefined;
    ghost = undefined;
    setDropTarget(undefined);
    setEdgeTarget(undefined);
    if (!current) {
      return;
    }
    if (current.kind === 'node') {
      pz?.enablePan();
      if (current.moved && current.id) {
        if (droppedEdge) {
          visualEditor.insertIntoEdge(current.id, droppedEdge.index);
        } else {
          const target = clusterAt(event.clientX, event.clientY)?.id;
          const node = visualEditor.nodes.find((n) => n.id === current.id);
          if (node && node.subgraph !== target) {
            visualEditor.moveToSubgraph(current.id, target);
          }
        }
      }
    } else if (!current.moved) {
      visualEditor.select(undefined);
    }
  };

  const onNodePointerDown = (event: PointerEvent) => {
    const id = nodeIdFromEl(event.currentTarget as Element);
    if (!id) {
      return;
    }
    event.stopPropagation();
    visualEditor.select(id);
    gesture = { id, kind: 'node', moved: false, x: event.clientX, y: event.clientY };
    pz?.disablePan();
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onBackgroundPointerDown = (event: PointerEvent) => {
    if ((event.target as Element).closest('g.node')) {
      return;
    }
    gesture = { kind: 'background', x: event.clientX, y: event.clientY, moved: false };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const wireInteractions = () => {
    if (!graphDiv) {
      return;
    }
    for (const el of graphDiv.querySelectorAll<SVGGElement>('g.node')) {
      const id = nodeIdFromEl(el);
      if (!id) {
        continue;
      }
      el.dataset.veId = id;
      el.classList.add('ve-node');
      el.addEventListener('pointerdown', onNodePointerDown);
    }
    clusterEntries = [];
    for (const el of graphDiv.querySelectorAll<SVGGElement>('g.cluster')) {
      const id = subgraphIdFromEl(el);
      if (id) {
        clusterEntries.push({ id, el });
      }
    }
    // Edge paths render in model-edge order, so the index maps straight back.
    edgeEntries = [...graphDiv.querySelectorAll<SVGPathElement>('g.edgePaths > path')].map(
      (el, index) => ({ el, index })
    );
    applySelection();
  };

  const renderView = async (config: string, code: string) => {
    if (!container) {
      return;
    }
    if (mayContainFontAwesome(code)) {
      await waitForFontAwesomeToLoad?.();
    }
    const viewID = uniqueID('visual-graph-');
    currentViewId = viewID;
    let parsedConfig: MermaidConfig;
    try {
      parsedConfig = JSON.parse(config) as MermaidConfig;
    } catch {
      parsedConfig = {};
    }
    const { svg } = await renderDiagram(parsedConfig, code, viewID);
    if (svg.length === 0) {
      return;
    }
    pz?.destroy();
    // eslint-disable-next-line svelte/no-dom-manipulating
    container.innerHTML = svg;
    const found = container.querySelector<SVGSVGElement>(`#${viewID}`);
    if (!found) {
      throw new Error('graph not found');
    }
    graphDiv = found;
    graphDiv.setAttribute('height', '100%');
    graphDiv.style.maxWidth = '100%';

    const previous = savedView;
    pz = panzoom(graphDiv, {
      center: true,
      controlIconsEnabled: false,
      dblClickZoomEnabled: false,
      fit: true,
      maxZoom: 12,
      minZoom: 0.2,
      onPan: (pan) => {
        const zoom = pz?.getZoom();
        if (zoom) {
          savedView = { pan, zoom };
        }
      },
      onZoom: (zoom) => {
        const pan = pz?.getPan();
        if (pan) {
          savedView = { pan, zoom };
        }
      }
    });
    if (previous) {
      pz.zoom(previous.zoom);
      pz.pan(previous.pan);
    }
    wireInteractions();
  };

  // Keep the model and the rendered view in sync with the diagram code.
  let pending = Promise.resolve();
  $effect(() => {
    const state = validatedState.current;
    const { code, mermaid: config, error } = state;
    pending = pending.then(async () => {
      await visualEditor.refresh(code);
      if (error || visualEditor.unsupported) {
        renderError = error !== undefined;
        return;
      }
      renderError = false;
      try {
        await renderView(config, code);
      } catch (error_) {
        console.error('visual editor render failed', error_);
        renderError = true;
      }
    });
  });

  // Re-apply the selection outline whenever the selected node changes.
  $effect(() => {
    void visualEditor.selectedId;
    applySelection();
  });

  const addNode = () => visualEditor.addNode(visualEditor.selectedNode?.subgraph);
  const resetView = () => {
    savedView = undefined;
    pz?.reset();
  };

  onDestroy(() => {
    pz?.destroy();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  });
</script>

<FontAwesome bind:waitForFontAwesomeToLoad />

<div class="flex h-full w-full flex-col overflow-hidden">
  {#if !visualEditor.unsupported}
    <!-- In-flow toolbar so the canvas sits below it and never hides nodes.
         Left padding leaves room for the floating Preview/Visual toggle. -->
    <div
      class="flex h-12 flex-none items-center justify-end gap-1 border-b border-muted bg-background py-1 pr-2 pl-28 sm:pl-52">
      <Button variant="ghost" size="icon" title="Fit to view" onclick={resetView}>
        <ResetIcon />
      </Button>
      <Button variant="ghost" size="icon" title="Zoom out" onclick={() => pz?.zoomOut()}>
        <ZoomOutIcon />
      </Button>
      <Button variant="ghost" size="icon" title="Zoom in" onclick={() => pz?.zoomIn()}>
        <ZoomInIcon />
      </Button>
      <Separator orientation="vertical" class="mx-1 h-6" />
      <Button variant="ghost" size="sm" title="Add a node" onclick={addNode}>
        <AddNodeIcon />
        <span class="hidden lg:inline">Node</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        title="Add a group"
        onclick={() => visualEditor.addSubgraph()}>
        <AddGroupIcon />
        <span class="hidden lg:inline">Group</span>
      </Button>
      <Separator orientation="vertical" class="mx-1 h-6" />
      <select
        class="h-8 rounded-md border border-input bg-transparent px-1 text-xs"
        title="Diagram direction"
        value={visualEditor.model?.direction ?? 'TB'}
        onchange={(e) => visualEditor.setDirection(e.currentTarget.value)}>
        {#each directions as dir (dir.value)}
          <option value={dir.value}>{dir.label}</option>
        {/each}
      </select>
    </div>
  {/if}

  <div class="relative flex-1 overflow-hidden">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      bind:this={container}
      onpointerdown={onBackgroundPointerDown}
      class={[
        'h-full w-full overflow-hidden',
        shouldShowGrid && `grid-bg-${mode.current}`,
        (renderError || visualEditor.unsupported) && 'opacity-40'
      ]}>
    </div>

    {#if visualEditor.unsupported}
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
        <div class="rounded-2xl border-2 border-muted bg-background/90 p-6 text-center shadow-lg">
          <p class="font-semibold">Visual editing is available for flowcharts</p>
          <p class="mt-1 text-sm text-muted-foreground">
            Switch the diagram to <code>flowchart</code> / <code>graph</code> to edit it visually, or
            use the code editor.
          </p>
        </div>
      </div>
    {:else if renderError}
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
        <div class="rounded-2xl border-2 border-muted bg-background/90 p-4 text-center shadow-lg">
          <p class="text-sm text-muted-foreground">
            Resolve the syntax error to keep editing visually.
          </p>
        </div>
      </div>
    {/if}

    {#if !visualEditor.unsupported}
      <div class="absolute top-2 right-2">
        <NodeInspector />
      </div>

      {#if !visualEditor.selectedId}
        <div
          class="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-muted/90 px-3 py-1 text-center text-xs text-muted-foreground shadow">
          Click a node to edit · Drag onto a connector to insert it · Drag onto a group to move it
        </div>
      {/if}
    {/if}

    {#if ghost}
      <div
        class="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-md border border-accent bg-background px-2 py-1 text-center text-xs font-medium shadow-lg"
        style="left: {ghost.x}px; top: {ghost.y}px">
        {ghost.label}
        {#if ghost.action}
          <div class="text-[10px] font-normal text-accent">{ghost.action}</div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .grid-bg-light {
    background-size: 30px 30px;
    background-image: radial-gradient(circle, #e4e4e48c 2px, #0000 2px);
  }

  .grid-bg-dark {
    background-size: 30px 30px;
    background-image: radial-gradient(circle, #46464646 2px, #0000 2px);
  }

  :global(.ve-node) {
    cursor: pointer;
  }

  :global(.ve-node:hover) {
    filter: drop-shadow(0 0 3px rgb(99 102 241 / 0.7));
  }

  :global(.ve-selected) {
    filter: drop-shadow(0 0 4px rgb(99 102 241 / 0.95));
  }

  :global(.ve-drop-target > rect),
  :global(.ve-drop-target > polygon),
  :global(.ve-drop-target > path) {
    stroke: #6366f1 !important;
    stroke-width: 2.5px !important;
    stroke-dasharray: 6 3 !important;
  }

  :global(.ve-edge-target) {
    stroke: #6366f1 !important;
    stroke-width: 4px !important;
  }
</style>
