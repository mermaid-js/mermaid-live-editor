<script lang="ts" context="module">
  declare global {
    interface Window {
      Cypress: boolean;
      editorLoaded: boolean;
    }
  }
</script>

<script lang="ts">
  import type { EditorMode } from '$lib/types';
  import { initEditor } from '$lib/util/monacoExtra';
  import { stateStore, updateCode, updateConfig } from '$lib/util/state';
  import { logEvent } from '$lib/util/stats';
  import { themeStore } from '$lib/util/theme';
  import { errorDebug, syncDiagram } from '$lib/util/util';
  import * as monaco from 'monaco-editor';
  import monacoEditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
  import monacoJsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
  import { onDestroy, onMount } from 'svelte';

  let divElement: HTMLDivElement | undefined;
  let editor: monaco.editor.IStandaloneCodeEditor | undefined;
  let editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: {
      enabled: false
    },
    theme: 'mermaid',
    overviewRulerLanes: 0
  };
  let text = '';

  stateStore.subscribe(({ errorMarkers, editorMode, code, mermaid }) => {
    // console.log('editor store subscription', { code, mermaid });
    if (!editor) {
      return;
    }

    // Update editor text if it's different
    const newText = editorMode === 'code' ? code : mermaid;
    if (newText !== text) {
      // console.log('updating editor text', newText);
      editor.setScrollTop(0);
      editor.setValue(newText);
      text = newText;
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

  themeStore.subscribe(({ isDark }) => {
    editor && monaco.editor.setTheme(isDark ? 'mermaid-dark' : 'mermaid');
  });

  const handleUpdate = (text: string, mode: EditorMode) => {
    // console.log('editor HandleUpdate', { text, mode });
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    initEditor(monaco);
    errorDebug();
    editor = monaco.editor.create(divElement, editorOptions);
    editor.onDidChangeModelContent(({ isFlush }) => {
      const newText = editor?.getValue();
      if (!newText || text === newText || isFlush) {
        return;
      }
      text = newText;
      handleUpdate(text, $stateStore.editorMode);
    });
    editor.addAction({
      id: 'mermaid-render-diagram',
      label: 'Render Diagram',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: function () {
        syncDiagram();
        logEvent('renderDiagram', {
          method: 'keyboardShortcut'
        });
      }
    });
    monaco.editor.setTheme($themeStore.isDark ? 'mermaid-dark' : 'mermaid');
    const resizeObserver = new ResizeObserver((entries) => {
      editor?.layout({
        height: entries[0].contentRect.height,
        width: entries[0].contentRect.width
      });
    });

    if (divElement.parentElement) {
      resizeObserver.observe(divElement);
    }

    if (window.Cypress) {
      window.editorLoaded = true;
    }
  });

  onDestroy(() => {
    editor?.dispose();
  });
</script>

<div class="flex h-full flex-col">
  <div bind:this={divElement} id="editor" class="h-full flex-grow overflow-hidden" />
  {#if $stateStore.error instanceof Error}
    <div class="flex flex-col text-sm text-neutral-100">
      <div class="flex items-center gap-2 bg-red-700 p-2">
        <i class="fa fa-exclamation-circle w-4" aria-hidden="true" />
        <p>Diagram syntax error</p>
      </div>
      <div class="max-h-32 overflow-auto bg-red-600 p-2 font-mono">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html $stateStore.error?.toString().replaceAll('\n', '<br />')}
      </div>
    </div>
  {/if}
</div>
