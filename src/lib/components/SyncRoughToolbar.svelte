<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { Separator } from '$/components/ui/separator';
  import { Switch } from '$/components/ui/switch';
  import { inputStateStore, stateStore } from '$/util/state';
  import { cmdKey, syncDiagram } from '$/util/util';
  import { slide } from 'svelte/transition';
  import SyncIcon from '~icons/material-symbols/sync-rounded';
  import FloatingToolbar from './FloatingToolbar.svelte';
</script>

<FloatingToolbar>
  <label class="label flex cursor-pointer items-center gap-2" for="rough">
    <span>Hand-Drawn</span>

    <Switch
      bind:checked={$inputStateStore.rough}
      onclick={() => {
        if (!$inputStateStore.autoSync) {
          syncDiagram();
        }
      }}
      id="rough" />
  </label>

  <Separator orientation="vertical" />

  <label class="label flex cursor-pointer items-center gap-2" for="autoSync">
    <span>Auto-Sync</span>
    <Switch bind:checked={$inputStateStore.autoSync} id="autoSync" />
  </label>

  {#if !$stateStore.autoSync}
    <div transition:slide={{ axis: 'x' }}>
      <Button
        size="icon"
        title="Sync Diagram ({cmdKey} + Enter)"
        aria-label="Sync Diagram"
        data-cy="sync"
        onclick={syncDiagram}><SyncIcon /></Button>
    </div>
  {/if}
</FloatingToolbar>
