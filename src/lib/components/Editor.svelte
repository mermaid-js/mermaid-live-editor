<script lang="ts">
  import type { EditorMode } from '$lib/types';
  import { stateStore, updateCode, updateConfig } from '$lib/util/state';
  import { themeStore } from '$lib/util/theme';
  import { errorDebug, syncDiagram } from '$lib/util/util';
  import type monaco from 'monaco-editor';
  import { onMount } from 'svelte';
  import initEditor from 'monaco-mermaid';
  import { logEvent } from '$lib/util/stats';

  let divEl: HTMLDivElement | undefined = undefined;
  let editor: monaco.editor.IStandaloneCodeEditor | undefined;
  let Monaco: typeof monaco | undefined;
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
    if (!editor || !Monaco) {
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
    const model = editor.getModel();
    if (!model) {
      console.error("editor model doesn't exist");
      return;
    }
    if (model.getLanguageId() !== language) {
      Monaco.editor.setModelLanguage(model, language);
    }

    // Display/clear errors
    Monaco.editor.setModelMarkers(model, 'mermaid', errorMarkers);
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
      // @ts-expect-error : This is a hack to handle a svelte-kit error when importing monaco.
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
    if (!Monaco) {
      throw new Error('Monaco failed to load');
    }
    if (!divEl) {
      throw new Error('divEl is undefined');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    initEditor(Monaco);
    errorDebug(100);
    editor = Monaco.editor.create(divEl, editorOptions);
    editor.onDidChangeModelContent(({ isFlush, changes }) => {
      const newText = editor?.getValue();
      console.log('editor onDidChangeModelContent', { text, newText, isFlush, changes });
      if (!newText || text === newText || isFlush) {
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
    Monaco.editor.setTheme($themeStore.isDark ? 'mermaid-dark' : 'mermaid');
    const resizeObserver = new ResizeObserver((entries) => {
      editor!.layout({
        height: entries[0].contentRect.height,
        width: entries[0].contentRect.width
      });
    });

    if (divEl.parentElement) {
      resizeObserver.observe(divEl.parentElement);
    }
    console.log(`editor mounted`);
    return () => {
      console.log(`editor disposed`);
      editor?.dispose();
    };
  });
</script>

<div bind:this={divEl} id="editor" class="overflow-hidden" />
