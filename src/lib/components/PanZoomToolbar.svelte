<script lang="ts">
  import type { PanZoomState } from '$/util/panZoom';
  import ExpandIcon from '~icons/material-symbols/open-in-full-rounded';
  import ArrowsToCircleIcon from '~icons/material-symbols/screenshot-frame-2';
  import MagnifyingGlassPlusIcon from '~icons/material-symbols/zoom-in';
  import MagnifyingGlassMinusIcon from '~icons/material-symbols/zoom-out';
  import FloatingToolbar from './FloatingToolbar.svelte';
  import { Button } from './ui/button';
  import { Separator } from './ui/separator';

  let { panZoomState }: { panZoomState: PanZoomState } = $props();
</script>

<FloatingToolbar>
  <Button variant="ghost" size="icon" title="Reset view" onclick={() => panZoomState.reset()}>
    <ArrowsToCircleIcon />
  </Button>
  <Separator orientation="vertical" />
  <Button variant="ghost" size="icon" onclick={() => panZoomState.zoomOut()}>
    <MagnifyingGlassMinusIcon />
  </Button>
  <Button variant="ghost" size="icon" onclick={() => panZoomState.zoomIn()}>
    <MagnifyingGlassPlusIcon />
  </Button>
  <Separator orientation="vertical" />
  <Button variant="ghost" size="icon" title="Full Screen">
    <ExpandIcon />
  </Button>
</FloatingToolbar>
