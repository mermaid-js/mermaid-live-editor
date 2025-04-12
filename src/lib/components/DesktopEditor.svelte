<script lang="ts">
  import type { EditorMode } from '$/types';
  import { stateStore, updateCode, updateConfig } from '$/util/state';
  import { initEditor } from '$lib/util/monacoExtra';
  import { errorDebug } from '$lib/util/util';
  import { mode } from 'mode-watcher';
  import * as monaco from 'monaco-editor';
  import monacoEditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
  import monacoJsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
  import { onMount } from 'svelte';

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

<div bind:this={divElement} id="editor" class="h-full flex-grow overflow-hidden"></div>
