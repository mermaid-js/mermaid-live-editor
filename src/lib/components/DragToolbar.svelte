<script lang="ts">
  import FloatingToolbar from '$/components/FloatingToolbar.svelte';
  import { Button } from '$/components/ui/button';
  import { Toggle } from '$/components/ui/toggle';
  import DownloadIcon from '~icons/material-symbols/download';
  import RedoIcon from '~icons/material-symbols/redo';
  import UndoIcon from '~icons/material-symbols/undo';
  import UnlockIcon from '~icons/material-symbols/lock-open-outline';

  let {
    interactiveMode = $bindable(false),
    canUndo = false,
    canRedo = false,
    onUndo = undefined,
    onRedo = undefined,
    onExport = undefined
  }: {
    interactiveMode?: boolean;
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: (() => void) | undefined;
    onRedo?: (() => void) | undefined;
    onExport?: (() => void) | undefined;
  } = $props();
</script>

<FloatingToolbar>
  <Toggle
    size="sm"
    variant="outline"
    title={interactiveMode ? 'Disable drag' : 'Enable drag'}
    bind:pressed={interactiveMode}>
    <UnlockIcon />
  </Toggle>
  <Button variant="ghost" size="icon" title="Undo (Ctrl+Z)" disabled={!canUndo} onclick={onUndo}>
    <UndoIcon />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    title="Redo (Ctrl+Shift+Z)"
    disabled={!canRedo}
    onclick={onRedo}>
    <RedoIcon />
  </Button>
  <Button variant="ghost" size="icon" title="Export Layout JSON" onclick={onExport}>
    <DownloadIcon />
  </Button>
</FloatingToolbar>
