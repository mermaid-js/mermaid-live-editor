<script>
  import { buttonVariants } from '$/components/ui/button';
  import * as Dialog from '$/components/ui/dialog';
  import ShareIcon from '~icons/material-symbols/share';
  import CopyInput from './CopyInput.svelte';
</script>

<Dialog.Root>
  <Dialog.Trigger class={buttonVariants({ size: 'sm' })}>Share</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2 text-xl">
        <ShareIcon class="size-5" /> Shareable links
      </Dialog.Title>
      <Dialog.Description>Share your diagrams with others.</Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <h2 class="flex items-center gap-2">
          <img class="size-5" src="/favicon.svg" alt="Mermaid Live Editor" />
          Mermaid Live Editor
        </h2>
        <CopyInput value={window.location.href} />
        <Dialog.Description>
          The content of the diagrams you create never leaves your browser.
        </Dialog.Description>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
