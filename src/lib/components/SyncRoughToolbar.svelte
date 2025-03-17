<script lang="ts">
  import FloatingToolbar from '$/components/FloatingToolbar.svelte';
  import { Separator } from '$/components/ui/separator';
  import { Switch } from '$/components/ui/switch';
  import { defaultState, inputStateStore } from '$/util/state';

  if ($inputStateStore.grid === undefined) {
    // Handle cases where old states were saved without grid option
    $inputStateStore.grid = defaultState.grid;
  }
</script>

<FloatingToolbar>
  <label class="label flex cursor-pointer items-center gap-2" for="rough">
    <span>Hand-Drawn</span>

    <Switch bind:checked={$inputStateStore.rough} id="rough" />
  </label>

  <Separator orientation="vertical" />

  <label class="label flex cursor-pointer items-center gap-2" for="grid">
    <span>Grid</span>
    <Switch bind:checked={$inputStateStore.grid} id="grid" />
  </label>
</FloatingToolbar>
