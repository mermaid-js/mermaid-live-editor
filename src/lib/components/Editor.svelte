<script lang="ts">
  import type { EditorMode } from '$lib/types';
  import { stateStore, updateCode, updateConfig } from '$lib/util/state';
  import { themeStore } from '$lib/util/theme';
  import { errorDebug, syncDiagram } from '$lib/util/util';
  import * as monaco from 'monaco-editor';
  import monacoJsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
  import monacoEditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
  import { onMount } from 'svelte';
  import { initEditor } from '$lib/util/monacoExtra';
  import { logEvent } from '$lib/util/stats';

  let divEl: HTMLDivElement | undefined = undefined;
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

    if (!divEl) {
      throw new Error('divEl is undefined');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    initEditor(monaco);
    errorDebug(100);
    editor = monaco.editor.create(divEl, editorOptions);
    editor.onDidChangeModelContent(({ isFlush, changes }) => {
      const newText = editor?.getValue();
      // console.log('editor onDidChangeModelContent', { text, newText, isFlush, changes });
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

    if (divEl.parentElement) {
      resizeObserver.observe(divEl.parentElement);
    }

    // @ts-ignore
    if (window.Cypress) {
      // @ts-ignore
      window.editorLoaded = true;
    }
    return () => {
      // console.log(`editor disposed`);
      editor?.dispose();
    };
  });
</script>

<div bind:this={divEl} id="editor" class="overflow-hidden" />
