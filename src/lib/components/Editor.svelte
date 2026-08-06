<script lang="ts">
  import DesktopEditor from '$/components/DesktopEditor.svelte';
  import MobileEditor from '$/components/MobileEditor.svelte';
  import { Button } from '$/components/ui/button';
  import { TID } from '$/constants';
  import { updateCode, updateConfig, validatedState } from '$lib/util/state.svelte';
  import { debounce } from 'lodash-es';
  import AutoFixIcon from '~icons/material-symbols/auto-fix-normal-rounded';
  import ExclamationCircleIcon from '~icons/material-symbols/error-outline-rounded';

  const { isMobile, onRepairSyntaxError } = $props<{
    isMobile: boolean;
    onRepairSyntaxError?: () => void;
  }>();
  const onUpdate = (text: string) => {
    if (validatedState.current.editorMode === 'code') {
      updateCode(text);
    } else {
      updateConfig(text);
    }
  };

  let showError = $state(false);

  const showErrorDebounced = debounce(() => {
    showError = true;
  }, 3000);

  $effect(() => {
    if (validatedState.current.error) {
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
  {#if showError && validatedState.current.error instanceof Error}
    <div class="flex flex-col text-sm" data-testid={TID.errorContainer}>
      <div class="flex items-center justify-between gap-2 bg-slate-900 p-2 text-white">
        <div class="flex w-fit items-center gap-2">
          <ExclamationCircleIcon class="size-6 text-destructive" aria-hidden="true" />
          <div class="flex flex-col">
            <p>Syntax error</p>
            {#if validatedState.current.editorMode === 'code'}
              <p class="text-xs text-white/60" data-testid={TID.aiHelpText}>
                Ask your local AI to suggest a fix
              </p>
            {/if}
          </div>
        </div>
        {#if validatedState.current.editorMode === 'code' && onRepairSyntaxError}
          <Button
            variant="accent"
            size="sm"
            data-testid={TID.aiRepairButton}
            onclick={onRepairSyntaxError}>
            <AutoFixIcon />
            Suggest fix
          </Button>
        {/if}
      </div>
      <output class="max-h-32 overflow-auto bg-muted p-2" name="mermaid-error" for="editor">
        <pre>{validatedState.current.error?.toString()}</pre>
      </output>
    </div>
  {/if}
</div>
