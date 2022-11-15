<script lang="ts">
  import type { EditorMode } from '$lib/types';
  import { stateStore, updateCode, updateConfig } from '$lib/util/state';
  import { themeStore } from '$lib/util/theme';
  import { errorDebug, syncDiagram } from '$lib/util/util';
  import type monaco from 'monaco-editor';
  import { onMount } from 'svelte';
  import initEditor from 'monaco-mermaid';
  import { logEvent } from '$lib/util/stats';

  let divEl: HTMLDivElement = null;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let Monaco: typeof monaco;
  let editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: {
      enabled: false
    },
    theme: 'mermaid',
    overviewRulerLanes: 0
  };
  let text = '';

  stateStore.subscribe(({ errorMarkers, editorMode, code, mermaid }) => {
    console.log('editor store subscription', { code, mermaid });
    if (!editor) {
      return;
    }

    // Update editor text if it's different
    const newText = editorMode === 'code' ? code : mermaid;
    if (newText !== text) {
      console.log('updating editor text', newText);
      editor.setValue(newText);
      text = newText;
    }

    // Update editor mode if it's different
    const language = editorMode === 'code' ? 'mermaid' : 'json';
    if (editor.getModel().getLanguageId() !== language) {
      Monaco?.editor.setModelLanguage(editor.getModel(), language);
    }

    // Display/clear errors
    Monaco?.editor.setModelMarkers(editor.getModel(), 'mermaid', errorMarkers);
  });

  themeStore.subscribe(({ isDark }) => {
    editor && Monaco?.editor.setTheme(isDark ? 'mermaid-dark' : 'mermaid');
  });

  const handleUpdate = (text: string, mode: EditorMode) => {
    console.log('editor HandleUpdate', { text, mode });
    if (mode === 'code') {
      updateCode(text);
    } else {
      updateConfig(text);
    }
  };

  const loadMonaco = async () => {
    console.log('Loading Monaco...');
    // errorDebug();
    let i = 0;
    while (i++ < 500) {
      // @ts-ignore : This is a hack to handle a svelte-kit error when importing monaco.
      Monaco = window.monaco;
      if (Monaco !== undefined) {
        return;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    alert('Loading Monaco Editor failed. Please try refreshing the page.');
  };

  onMount(async () => {
    await loadMonaco(); // Fix https://github.com/mermaid-js/mermaid-live-editor/issues/175
    initEditor(Monaco);
    errorDebug(100);
    editor = Monaco.editor.create(divEl, editorOptions);
    editor.onDidChangeModelContent(({ isFlush, changes }) => {
      const newText = editor.getValue();
      console.log('editor onDidChangeModelContent', { text, newText, isFlush, changes });
      if (text === newText || isFlush) {
        return;
      }
      text = newText;
      handleUpdate(text, $stateStore.editorMode);
    });
    editor.addAction({
      id: 'mermaid-render-diagram',
      label: 'Render Diagram',
      keybindings: [Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.Enter],
      run: function () {
        syncDiagram();
        logEvent('renderDiagram', {
          method: 'keyboadShortcut'
        });
      }
    });
    Monaco?.editor.setTheme($themeStore.isDark ? 'mermaid-dark' : 'mermaid');
    const resizeObserver = new ResizeObserver((entries) => {
      editor.layout({
        height: entries[0].contentRect.height,
        width: entries[0].contentRect.width
      });
    });

    resizeObserver.observe(divEl.parentElement);
    console.log(`editor mounted`);
    return () => {
      console.log(`editor disposed`);
      editor.dispose();
    };
  });
</script>

<div bind:this={divEl} id="editor" class="overflow-hidden" />
