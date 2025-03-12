<script lang="ts">
  import type { PanZoomState } from '$/util/panZoom';
  import FloatingToolbar from './FloatingToolbar.svelte';
  import { Button } from './ui/button';
  import { Separator } from './ui/separator';

  let { panZoomState }: { panZoomState: PanZoomState } = $props();
</script>

<FloatingToolbar>
  <Button variant="ghost" size="icon" title="Reset view" onclick={() => panZoomState.reset()}
    ><i class="fas fa-arrows-to-circle"></i></Button>
  <Separator orientation="vertical" />
  <Button variant="ghost" size="icon" onclick={() => panZoomState.zoomIn()}
    ><i class="fa-solid fa-magnifying-glass-plus"></i></Button>
  <Button variant="ghost" size="icon" onclick={() => panZoomState.zoomOut()}
    ><i class="fa-solid fa-magnifying-glass-minus"></i></Button>
  <Separator orientation="vertical" />
  <Button variant="ghost" size="icon" title="Full Screen"><i class="fas fa-expand"></i></Button>
</FloatingToolbar>
