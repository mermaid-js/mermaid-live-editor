<script lang="ts">
  import { inputStateStore, stateStore } from '$/util/state';
  import { cmdKey, syncDiagram } from '$/util/util';
  import { slide } from 'svelte/transition';
  import SyncIcon from '~icons/fa6-solid/arrows-rotate';
  import FloatingToolbar from './FloatingToolbar.svelte';
  import { Switch } from './ui/switch';
</script>

<FloatingToolbar>
  <label class="label flex cursor-pointer items-center gap-2" for="rough">
    <Switch
      bind:checked={$inputStateStore.rough}
      onclick={() => {
        if (!$inputStateStore.autoSync) {
          syncDiagram();
        }
      }}
      name="rough" />
    <span>Hand drawn</span>
  </label>

  <label class="label flex cursor-pointer items-center gap-2" for="autoSync">
    <Switch bind:checked={$inputStateStore.autoSync} name="autoSync" />
    <span> Auto sync</span>
  </label>

  {#if !$stateStore.autoSync}
    <button
      transition:slide={{ axis: 'x' }}
      class="btn btn-secondary btn-xs ml-2"
      title="Sync Diagram ({cmdKey} + Enter)"
      aria-label="Sync Diagram"
      data-cy="sync"
      onclick={syncDiagram}><SyncIcon /></button>
  {/if}
</FloatingToolbar>
