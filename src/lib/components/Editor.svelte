<script lang="ts">
  import McWrapper from '$/components/McWrapper.svelte';
  import MermaidChartIcon from '$/components/MermaidChartIcon.svelte';
  import { Button } from '$/components/ui/button';
  import { TID } from '$/constants';
  import { env } from '$/util/env';
  import type { EditorMode } from '$lib/types';
  import { initEditor } from '$lib/util/monacoExtra';
  import { stateStore, updateCode, updateConfig, urlsStore } from '$lib/util/state';
  import { errorDebug } from '$lib/util/util';
  import { mode } from 'mode-watcher';
  import * as monaco from 'monaco-editor';
  import monacoEditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
  import monacoJsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
  import { onMount } from 'svelte';
  import ExclamationCircleIcon from '~icons/material-symbols/error-outline-rounded';

  let divElement: HTMLDivElement | undefined = $state();
  let editor: monaco.editor.IStandaloneCodeEditor | undefined;
  let editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: {
      enabled: false
    },
    theme: 'mermaid',
    overviewRulerLanes: 0
  };
  let currentText = '';

  const unsubscribeState = stateStore.subscribe(({ errorMarkers, editorMode, code, mermaid }) => {
    if (!editor) {
      return;
    }

    // Update editor text if it's different
    const newText = editorMode === 'code' ? code : mermaid;
    if (newText !== currentText) {
      editor.setScrollTop(0);
      editor.setValue(newText);
      currentText = newText;
    }

    // Update editor mode if it's different
    const language = editorMode === 'code' ? 'mermaid' : 'json';
    const model = editor.getModel();
    if (!model) {
      console.error("editor model doesn't exist");
      return;
    }
    if (model.getLanguageId() !== language) {
      monaco.editor.setModelLanguage(model, language);
    }

    // Display/clear errors
    monaco.editor.setModelMarkers(model, 'mermaid', errorMarkers);
  });

  const handleUpdate = (text: string, mode: EditorMode) => {
    if (mode === 'code') {
      updateCode(text);
    } else {
      updateConfig(text);
    }
  };

  onMount(() => {
    self.MonacoEnvironment = {
      getWorker(_, label) {
        if (label === 'json') {
          return new monacoJsonWorker();
        }
        return new monacoEditorWorker();
      }
    };

    if (!divElement) {
      throw new Error('divEl is undefined');
    }

    initEditor(monaco);
    errorDebug();
    editor = monaco.editor.create(divElement, editorOptions);
    editor.onDidChangeModelContent(({ isFlush }) => {
      const newText = editor?.getValue();
      if (!newText || currentText === newText || isFlush) {
        return;
      }
      currentText = newText;
      handleUpdate(currentText, $stateStore.editorMode);
    });
    const unsubscribeMode = mode.subscribe((mode) => {
      editor && monaco.editor.setTheme(`mermaid${mode === 'dark' ? '-dark' : ''}`);
    });
    const resizeObserver = new ResizeObserver((entries) => {
      editor?.layout({
        height: entries[0].contentRect.height,
        width: entries[0].contentRect.width
      });
    });

    if (divElement.parentElement) {
      resizeObserver.observe(divElement);
    }

    return () => {
      unsubscribeState();
      unsubscribeMode();
      resizeObserver.disconnect();
      editor?.dispose();
    };
  });
</script>

<div class="flex h-full flex-col pt-1">
  <div bind:this={divElement} id="editor" class="h-full flex-grow overflow-hidden"></div>
  {#if $stateStore.error instanceof Error}
    <div class="flex flex-col text-sm" data-testid={TID.errorContainer}>
      <div class="flex items-center justify-between gap-2 bg-slate-900 p-2 text-white">
        <div class="flex w-fit items-center gap-2">
          <ExclamationCircleIcon class="size-6 text-destructive" aria-hidden="true" />
          <div class="flex flex-col">
            <p>Syntax error</p>
            {#if env.isEnabledMermaidChartLinks}
              <p class="text-xs text-white/60">Create a free account to repair with AI</p>
            {/if}
          </div>
        </div>
        <McWrapper>
          <Button
            variant="accent"
            size="sm"
            href={$urlsStore.mermaidChart({ medium: 'ai_repair' }).save}>
            <MermaidChartIcon />
            AI Repair
          </Button>
        </McWrapper>
      </div>
      <output class="max-h-32 overflow-auto bg-muted p-2" name="mermaid-error" for="editor">
        <pre>{$stateStore.error?.toString()}</pre>
      </output>
    </div>
  {/if}
</div>
