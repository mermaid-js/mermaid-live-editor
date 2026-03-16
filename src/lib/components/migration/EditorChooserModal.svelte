<script lang="ts">
  import { Button } from '$/components/ui/button';
  import * as Dialog from '$/components/ui/dialog';
  import { dismissEditorChooser } from '$/util/migration/domainMigration';
  import { logEvent, logMermaidChartClick } from '$/util/stats';
  import { getCheckoutUrl } from '$/util/util';
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

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();

  const close = () => {
    dismissEditorChooser();
    open = false;
  };

  const handleStartTrial = () => {
    logEvent('chooseEditor', { choice: 'plus' });
    logMermaidChartClick('editorPicker');
    close();
    window.open(
      getCheckoutUrl({ utmCampaign: 'start_plus', utmMedium: '2_editor_selection' }),
      '_blank'
    );
  };

  const handleStartFree = () => {
    logEvent('chooseEditor', { choice: 'openSource' });
    close();
  };

  const handleContinueToNewHome = () => {
    logEvent('chooseEditor', { choice: 'newHome' });
    close();
    window.open('https://mermaid.ai/live', '_blank');
  };
</script>

<Dialog.Root
  bind:open
  onOpenChange={(v) => {
    if (!v) handleStartFree();
  }}>
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

            <Button variant="accent" class="w-full" onclick={handleStartTrial}>
              Start free trial
            </Button>
          </div>

          <ul class="space-y-3 text-sm">
            <li class="flex items-center gap-2">
              <EditIcon class="size-4 shrink-0 text-muted-foreground" />
              Visual editor
            </li>
            <li class="flex items-center gap-2">
              <SparklesIcon class="size-4 shrink-0 text-muted-foreground" />
              300 AI credits
            </li>
            <li class="flex items-center gap-2">
              <HomeIcon class="size-4 shrink-0 text-muted-foreground" />
              Unlimited diagram storage
            </li>
            <li class="flex items-center gap-2">
              <WidthIcon class="size-4 shrink-0 text-muted-foreground" />
              Limitless diagram size
            </li>
            <li class="flex items-center gap-2">
              <ChatIcon class="size-4 shrink-0 text-muted-foreground" />
              View & comment collaboration
            </li>
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
          <Button variant="outline" class="w-full border-accent" onclick={handleContinueToNewHome}>
            Continue to mermaid.ai/live
            <ArrowIcon class="ml-1 size-4" />
          </Button>
          <Button variant="outline" class="w-full" onclick={handleStartFree}>
            Stay on mermaid.live
          </Button>
        </div>

        <ul class="space-y-3 text-sm">
          <li class="flex items-center gap-2">
            <LanguageIcon class="size-4 shrink-0 text-muted-foreground" />
            Diagram stored in URL
          </li>
          <li class="flex items-center gap-2">
            <CodeIcon class="size-4 shrink-0 text-muted-foreground" />
            Code editor
          </li>
          <li class="flex items-center gap-2">
            <OpenSourceIcon class="size-4 shrink-0 text-muted-foreground" />
            Open source
          </li>
          <li class="flex items-center gap-2">
            <HistoryIcon class="size-4 shrink-0 text-muted-foreground" />
            Version history
          </li>
        </ul>
      </div>
    </div>

    <div class="text-center">
      <a
        href="https://mermaid.ai/privacy-policy"
        target="_blank"
        class="text-sm text-foreground underline hover:text-accent">
        mermaid.ai Privacy Policy
      </a>
    </div>
  </Dialog.Content>
</Dialog.Root>
