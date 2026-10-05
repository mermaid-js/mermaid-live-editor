<script lang="ts">
  import FloatingToolbar from '$/components/FloatingToolbar.svelte';
  import { TID } from '$/constants';
  import { Button } from '$/components/ui/button';
  import { Separator } from '$/components/ui/separator';
  import type { PanZoomState } from '$/util/panZoom';
  import ExpandIcon from '~icons/material-symbols/open-in-full-rounded';
  import ArrowsToCircleIcon from '~icons/material-symbols/screenshot-frame-2';
  import MagnifyingGlassPlusIcon from '~icons/material-symbols/zoom-in';
  import MagnifyingGlassMinusIcon from '~icons/material-symbols/zoom-out';

  let {
    /** Embed/narrow frames: keep zoom buttons visible below the `sm` breakpoint. */
    compact = false,
    livePreviewHref,
    panZoomState
  }: {
    compact?: boolean;
    /** When set, shows a live preview link. Omit for store-free embeds. */
    livePreviewHref?: string;
    panZoomState: PanZoomState;
  } = $props();

  const zoomClass = $derived(compact ? undefined : 'hidden sm:block');
</script>

<FloatingToolbar>
  <Button variant="ghost" size="icon" title="Reset view" onclick={() => panZoomState.reset()}>
    <ArrowsToCircleIcon />
  </Button>
  <Separator orientation="vertical" />
  <Button
    variant="ghost"
    size="icon"
    class={zoomClass}
    title="Zoom out"
    onclick={() => panZoomState.zoomOut()}>
    <MagnifyingGlassMinusIcon />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    class={zoomClass}
    title="Zoom in"
    onclick={() => panZoomState.zoomIn()}>
    <MagnifyingGlassPlusIcon />
  </Button>
  {#if livePreviewHref}
    <Separator orientation="vertical" class={zoomClass} />
    <Button
      variant="ghost"
      size="icon"
      data-testid={TID.livePreviewButton}
      title="Open Live Preview"
      href={livePreviewHref}
      target="_blank">
      <ExpandIcon />
    </Button>
  {/if}
</FloatingToolbar>
