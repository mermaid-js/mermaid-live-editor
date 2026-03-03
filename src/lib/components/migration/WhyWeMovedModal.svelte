<script lang="ts">
  import { Button } from '$/components/ui/button';
  import * as Dialog from '$/components/ui/dialog';
  import { redirectToMermaidLive } from '$/util/migration/domainMigration';
  import BookIcon from '~icons/material-symbols/book-2-outline-rounded';
  import ExternalLinkIcon from '~icons/material-symbols/open-in-new-rounded';
  import ShieldIcon from '~icons/material-symbols/shield-lock-outline-rounded';

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { open = $bindable(), onOpenChange }: Props = $props();

  const handleUseMermaidLive = () => {
    redirectToMermaidLive();
  };

  const handleGotIt = () => {
    onOpenChange(false);
  };
</script>

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Content class="max-w-lg p-8">
    <Dialog.Header>
      <Dialog.Title class="text-2xl font-semibold">Why the new address?</Dialog.Title>
    </Dialog.Header>

    <div class="mt-4 space-y-4">
      <p class="text-muted-foreground">
        We're consolidating the Mermaid ecosystem under mermaid.ai — one home for the editor, docs,
        and the commercial platform.
      </p>

      <div class="space-y-4 border-t pt-4">
        <div class="flex items-start gap-3">
          <ShieldIcon class="mt-0.5 size-5 shrink-0 text-green-600" />
          <div>
            <p class="font-medium">Same privacy</p>
            <p class="text-sm text-muted-foreground">
              Diagrams render client-side. No data sent to servers.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <BookIcon class="mt-0.5 size-5 shrink-0 text-blue-600" />
          <div>
            <p class="font-medium">Same open-source code</p>
            <p class="text-sm text-muted-foreground">Identical codebase. MIT licensed.</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <ExternalLinkIcon class="mt-0.5 size-5 shrink-0 text-purple-600" />
          <div>
            <p class="font-medium">Old links still work</p>
            <p class="text-sm text-muted-foreground">
              All mermaid.live URLs with diagrams keep working.
            </p>
          </div>
        </div>
      </div>
    </div>

    <Dialog.Footer class="mt-6 flex gap-3">
      <Button variant="outline" onclick={handleUseMermaidLive}>Use mermaid.live</Button>
      <Button variant="accent" onclick={handleGotIt}>Got it</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
