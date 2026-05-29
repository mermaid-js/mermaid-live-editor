<script lang="ts">
  import * as Dialog from '$/components/ui/dialog';
  import { dismissEditorChooser } from '$/util/migration/domainMigration';
  import EditorChooserTestB from './EditorChooserTestB.svelte';
  import { createEditorChooserActions } from './editorChooserActions';

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();
  // Tracks whether the current close was triggered by an explicit action
  // (button click logs its own event) vs. implicit dismissal (ESC/click-outside).
  let handled = false;
  const actions = createEditorChooserActions(() => {
    handled = true;
    open = false;
  });
</script>

<Dialog.Root
  bind:open
  onOpenChange={(v) => {
    if (v) return;
    if (!handled) actions.log('dismissed');
    handled = false;
    dismissEditorChooser();
  }}>
  <EditorChooserTestB {actions} />
</Dialog.Root>
