<script lang="ts">
  import DesktopEditor from '$/components/DesktopEditor.svelte';
  import McWrapper from '$/components/McWrapper.svelte';
  import MermaidChartIcon from '$/components/MermaidChartIcon.svelte';
  import MobileEditor from '$/components/MobileEditor.svelte';
  import { Button } from '$/components/ui/button';
  import { TID } from '$/constants';
  import { env } from '$/util/env';
  import { stateStore, updateCode, updateConfig, urlsStore } from '$lib/util/state';
  import { debounce } from 'lodash-es';
  import ExclamationCircleIcon from '~icons/material-symbols/error-outline-rounded';

  const { isMobile } = $props<{ isMobile: boolean }>();
  const onUpdate = (text: string) => {
    if ($stateStore.editorMode === 'code') {
      updateCode(text);
    } else {
      updateConfig(text);
    }
  };

  let showError = $state(false);

  const showErrorDebounced = debounce(() => {
    showError = true;
  }, 5000);

  $effect(() => {
    if ($stateStore.error) {
      showErrorDebounced();
    } else {
      showErrorDebounced.cancel();
      showError = false;
    }

    return () => {
      showErrorDebounced.cancel();
    };
  });
</script>

<div class="flex h-full flex-col">
  {#if isMobile}
    <MobileEditor {onUpdate} />
  {:else}
    <DesktopEditor {onUpdate} />
  {/if}
  {#if showError && $stateStore.error instanceof Error}
    <div class="flex flex-col text-sm" data-testid={TID.errorContainer}>
      <div class="flex items-center justify-between gap-2 bg-slate-900 p-2 text-white">
        <div class="flex w-fit items-center gap-2">
          <ExclamationCircleIcon class="size-6 text-destructive" aria-hidden="true" />
          <div class="flex flex-col">
            <p>Syntax error</p>
            {#if env.isEnabledMermaidChartLinks && $stateStore.editorMode === 'code'}
              <p class="text-xs text-white/60" data-testid={TID.aiHelpText}>
                Create a free account to repair with AI
              </p>
            {/if}
          </div>
        </div>
        {#if $stateStore.editorMode === 'code'}
          <McWrapper>
            <Button
              variant="accent"
              size="sm"
              data-testid={TID.aiRepairButton}
              href={$urlsStore.mermaidChart({ medium: 'ai_repair' }).save}>
              <MermaidChartIcon />
              AI Repair
            </Button>
          </McWrapper>
        {/if}
      </div>
      <output class="max-h-32 overflow-auto bg-muted p-2" name="mermaid-error" for="editor">
        <pre>{$stateStore.error?.toString()}</pre>
      </output>
    </div>
  {/if}
</div>
