<script lang="ts">
  import * as Dialog from '$/components/ui/dialog';
  import { dismissEditorChooser, getEditorChooserVariant } from '$/util/migration/domainMigration';
  import EditorChooserControl from './EditorChooserControl.svelte';
  import EditorChooserTestA from './EditorChooserTestA.svelte';
  import EditorChooserTestB from './EditorChooserTestB.svelte';
  import EditorChooserTestC from './EditorChooserTestC.svelte';
  import { createEditorChooserActions } from './editorChooserActions';

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();
  const variant = getEditorChooserVariant();
  // Tracks whether the current close was triggered by an explicit action
  // (button click logs its own event) vs. implicit dismissal (ESC/click-outside).
  let handled = false;
  const actions = createEditorChooserActions(variant, () => {
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
  {#if variant === 'testA'}
    <EditorChooserTestA {actions} />
  {:else if variant === 'testB'}
    <EditorChooserTestB {actions} />
  {:else if variant === 'testC'}
    <EditorChooserTestC {actions} />
  {:else}
    <EditorChooserControl {actions} />
  {/if}
</Dialog.Root>
