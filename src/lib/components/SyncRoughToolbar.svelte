<script lang="ts">
  import FloatingToolbar from '$/components/FloatingToolbar.svelte';
  import { Toggle } from '$/components/ui/toggle';
  import { defaultState, inputStateStore } from '$/util/state';
  import RoughIcon from '~icons/material-symbols/draw-outline-rounded';
  import BackgroundIcon from '~icons/material-symbols/grid-4x4-rounded';

  if ($inputStateStore.grid === undefined) {
    // Handle cases where old states were saved without grid option
    $inputStateStore.grid = defaultState.grid;
  }
</script>

<FloatingToolbar>
  <Toggle bind:pressed={$inputStateStore.rough} size="sm" title="Hand-Drawn">
    <RoughIcon />
  </Toggle>
  <Toggle bind:pressed={$inputStateStore.grid} size="sm" title="Background Grid">
    <BackgroundIcon />
  </Toggle>
</FloatingToolbar>
