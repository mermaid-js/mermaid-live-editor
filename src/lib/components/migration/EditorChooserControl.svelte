<script lang="ts">
  import McWrapper from '$/components/McWrapper.svelte';
  import PrivacyPolicyLink from '$/components/migration/PrivacyPolicyLink.svelte';
  import { Button } from '$/components/ui/button';
  import * as Dialog from '$/components/ui/dialog';
  import CodeIcon from '~icons/custom/code';
  import ArrowIcon from '~icons/material-symbols/arrow-forward-rounded';
  import OpenSourceIcon from '~icons/material-symbols/book-2-outline-rounded';
  import ChatIcon from '~icons/material-symbols/chat-outline-rounded';
  import EditIcon from '~icons/material-symbols/edit-outline-rounded';
  import HistoryIcon from '~icons/material-symbols/history';
  import HomeIcon from '~icons/material-symbols/home-storage-outline-rounded';
  import SparklesIcon from '~icons/material-symbols/kid-star-outline';
  import LanguageIcon from '~icons/material-symbols/language';
  import WidthIcon from '~icons/material-symbols/width-rounded';
  import type { EditorChooserVariantProps } from './editorChooserActions';

  let { actions }: EditorChooserVariantProps = $props();

  const plusFeatures = [
    { icon: EditIcon, label: 'Visual editor' },
    { icon: SparklesIcon, label: '300 AI credits' },
    { icon: HomeIcon, label: 'Unlimited diagram storage' },
    { icon: WidthIcon, label: 'Limitless diagram size' },
    { icon: ChatIcon, label: 'View & comment collaboration' }
  ];
  const openSourceFeatures = [
    { icon: LanguageIcon, label: 'Diagram stored in URL' },
    { icon: CodeIcon, label: 'Code editor' },
    { icon: OpenSourceIcon, label: 'Open source' },
    { icon: HistoryIcon, label: 'Version history' }
  ];
</script>

<Dialog.Content class="flex max-w-2xl flex-col gap-6 bg-pink-50 p-6 dark:bg-background">
  <Dialog.Header>
    <Dialog.Title class="text-center text-2xl font-semibold">Choose your editor</Dialog.Title>
    <Dialog.Description class="text-center text-sm font-light">
      You'll never see this again
    </Dialog.Description>
  </Dialog.Header>

  <div class="grid gap-4 sm:grid-cols-2">
    <!-- Mermaid Plus Card -->
    <div
      class="relative flex flex-col overflow-hidden rounded-xl border-2 border-accent bg-white shadow dark:bg-card">
      <div class="bg-accent px-6 py-2 text-center text-sm font-semibold text-accent-foreground">
        Recommended
      </div>

      <div class="flex flex-col gap-4 p-6">
        <div>
          <h3 class="text-xl font-bold">Mermaid Plus</h3>
          <p class="text-sm text-muted-foreground">Unlock AI, storage and collaboration</p>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex justify-center">
            <span
              class="rounded-full bg-pink-100 px-3 py-0.5 text-xs font-semibold text-pink-700 dark:bg-pink-950 dark:text-pink-300">
              10% off with code JS26
            </span>
          </div>

          <McWrapper labelPrefix="Opens ">
            <Button variant="accent" class="w-full" onclick={() => actions.startTrial()}>
              Start free trial
            </Button>
          </McWrapper>
        </div>

        <ul class="space-y-3 text-sm">
          {#each plusFeatures as feature (feature.label)}
            <li class="flex items-center gap-2">
              <feature.icon class="size-4 shrink-0 text-muted-foreground" />
              {feature.label}
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <!-- Open Source Card -->
    <div class="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow dark:bg-card">
      <div class="flex flex-col justify-end pt-10">
        <h3 class="text-xl font-bold">Open Source</h3>
        <p class="text-sm text-muted-foreground">Code only, no login, always free</p>
      </div>

      <div class="flex flex-col gap-2">
        <p class="mt-2 text-sm text-muted-foreground">Mermaid has a new home</p>
        <McWrapper labelPrefix="Opens ">
          <Button
            variant="outline"
            class="w-full border-accent"
            onclick={() => actions.openMermaidAiLive('continueToNewHome')}>
            Continue to mermaid.ai/live
            <ArrowIcon class="ml-1 size-4" />
          </Button>
        </McWrapper>
        <Button variant="outline" class="w-full" onclick={() => actions.dismiss('stayOnLive')}>
          Stay on mermaid.live
        </Button>
      </div>

      <ul class="space-y-3 text-sm">
        {#each openSourceFeatures as feature (feature.label)}
          <li class="flex items-center gap-2">
            <feature.icon class="size-4 shrink-0 text-muted-foreground" />
            {feature.label}
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <PrivacyPolicyLink />
</Dialog.Content>
