<script lang="ts">
  import FloatingToolbar from '#lib/components/FloatingToolbar.svelte';
  import { Toggle } from '#lib/components/ui/toggle/index.js';
  import { defaultState, inputState, updateCodeStore } from '#lib/util/state.svelte.js';
  import RoughIcon from '~icons/material-symbols/draw-outline-rounded';
  import BackgroundIcon from '~icons/material-symbols/grid-4x4-rounded';

  if (inputState.grid === undefined) {
    // Handle cases where old states were saved without grid option
    updateCodeStore({ grid: defaultState.grid });
  }
</script>

<FloatingToolbar>
  <Toggle
    bind:pressed={() => inputState.rough, (rough) => updateCodeStore({ rough })}
    size="sm"
    title="Hand-Drawn">
    <RoughIcon />
  </Toggle>
  <Toggle
    bind:pressed={() => inputState.grid ?? defaultState.grid, (grid) => updateCodeStore({ grid })}
    size="sm"
    title="Background Grid">
    <BackgroundIcon />
  </Toggle>
</FloatingToolbar>
