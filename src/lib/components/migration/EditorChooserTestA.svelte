<script lang="ts">
  import McWrapper from '$/components/McWrapper.svelte';
  import PrivacyPolicyLink from '$/components/migration/PrivacyPolicyLink.svelte';
  import { Button } from '$/components/ui/button';
  import * as Dialog from '$/components/ui/dialog';
  import { asset } from '$app/paths';
  import type { EditorChooserVariantProps } from './editorChooserActions';

  let { actions }: EditorChooserVariantProps = $props();

  const openSourceFeatures = [
    'Diagram stored in URL',
    'Code editor',
    'Open source',
    'Version history'
  ];
  const plusFeatures = [
    'AI diagramming',
    'Visual editor',
    'Encrypted diagram storage',
    'Premium plugins',
    'View & comment collaboration'
  ];
</script>

<Dialog.Content class="flex max-w-3xl flex-col gap-6 bg-background p-8">
  <Dialog.Header>
    <Dialog.Title class="text-center text-2xl font-bold">Choose your editor</Dialog.Title>
    <Dialog.Description class="sr-only">
      Choose between the open source editor or Mermaid Plus
    </Dialog.Description>
  </Dialog.Header>

  <div class="grid gap-4 sm:grid-cols-2">
    <!-- Open Source Card -->
    <div class="flex flex-col gap-4 rounded-xl border bg-card p-6">
      <div class="flex items-center">
        <img class="size-10" src={asset('/favicon.svg')} alt="Mermaid Live Editor" />
      </div>
      <div>
        <h3 class="text-xl font-bold">Open source</h3>
        <p class="text-sm text-muted-foreground">Code only, no login, always free</p>
      </div>

      <ul class="flex flex-col gap-2 text-sm">
        {#each openSourceFeatures as feature (feature)}
          <li class="flex items-center gap-3 rounded-lg border border-border p-3">
            <span class="size-2 shrink-0 rounded-full bg-blue-500"></span>
            {feature}
          </li>
        {/each}
      </ul>

      <Button
        variant="outline"
        class="mt-auto self-start"
        onclick={() => actions.dismiss('continueToLive')}>
        Continue to mermaid.live
      </Button>
    </div>

    <!-- Mermaid Plus Card -->
    <div class="flex flex-col gap-4 rounded-xl border bg-card p-6">
      <div class="flex items-center gap-3">
        <img class="size-10" src={asset('/mermaidchart-logo.svg')} alt="Mermaid Chart" />
        <span
          class="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
          Recommended
        </span>
      </div>
      <div>
        <h3 class="text-xl font-bold">Mermaid Plus</h3>
        <p class="text-sm text-muted-foreground">Unlock AI, storage and collaboration</p>
      </div>

      <ul class="flex flex-col gap-2 text-sm">
        {#each plusFeatures as feature (feature)}
          <li class="flex items-center gap-3 rounded-lg border border-border p-3">
            <span class="size-2 shrink-0 rounded-full bg-blue-500"></span>
            {feature}
          </li>
        {/each}
      </ul>

      <McWrapper labelPrefix="Opens ">
        <Button variant="accent" class="mt-auto self-start" onclick={() => actions.startTrial()}>
          Start free trial
        </Button>
      </McWrapper>
    </div>
  </div>

  <PrivacyPolicyLink />
</Dialog.Content>
