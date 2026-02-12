<script lang="ts">
  import type { EditorProps } from '$/types';
  import { env } from '$/util/env';
  import { stateStore, urlsStore } from '$/util/state';
  import { isMac } from '$/util/util';
  import { initEditor } from '$lib/util/monacoExtra';
  import { errorDebug } from '$lib/util/util';
  import { mode } from 'mode-watcher';
  import * as monaco from 'monaco-editor';
  import monacoEditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
  import monacoJsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
  import { onMount } from 'svelte';
  import AIGlyphPopup from './AIGlyphPopup.svelte';

  const { onUpdate }: EditorProps = $props();

  let divElement: HTMLDivElement | undefined = $state();
  let editor: monaco.editor.IStandaloneCodeEditor | undefined;
  let editorOptions = {
    minimap: {
      enabled: false
    },
    overviewRulerLanes: 0,
    glyphMargin: true
  } satisfies monaco.editor.IStandaloneEditorConstructionOptions;
  let currentText = '';
  let showPopup = $state(false);
  let popupPosition = $state({ top: 0 });
  let decorationsCollection: monaco.editor.IEditorDecorationsCollection | undefined;
  let hintCollection: monaco.editor.IEditorDecorationsCollection | undefined;
  let suggestion = $state('');
  let lastMouseLine = 0;

  const quickEditHintStyle = `--quick-edit-hint-text: '${isMac ? 'Quick edit (⌘⏎)' : 'Quick edit (Ctrl+⏎)'}'`;

  const jsonModel = monaco.editor.createModel(
    '',
    'json',
    monaco.Uri.parse('internal://config.json')
  );
  const mermaidModel = monaco.editor.createModel(
    '',
    'mermaid',
    monaco.Uri.parse('internal://mermaid.mmd')
  );

  const renderQuickEditHint = () => {
    hintCollection?.clear();
    decorationsCollection?.clear();
    if (!editor || showPopup) {
      return;
    }
    const model = editor.getModel();
    const position = editor.getPosition();
    if (!model) {
      return;
    }

    if (lastMouseLine > 0 && model.id === mermaidModel.id) {
      decorationsCollection?.set([
        {
          range: new monaco.Range(lastMouseLine, 1, lastMouseLine, 1),
          options: {
            isWholeLine: true,
            glyphMarginClassName: 'suggestion-icon'
          }
        }
      ]);
    }

    if (position) {
      const { lineNumber } = position;
      if (model.getLineContent(lineNumber).trim() === '') {
        const column = model.getLineMaxColumn(lineNumber);
        hintCollection?.set([
          {
            range: new monaco.Range(lineNumber, column, lineNumber, column),
            options: {
              afterContentClassName: 'quick-edit-hint'
            }
          }
        ]);
      }
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

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: true,
      schemas: [
        {
          fileMatch: ['config.json'],
          uri: `${env.docsUrl}/schemas/config.schema.json`
        }
      ]
    });

    initEditor(monaco);
    errorDebug();
    editor = monaco.editor.create(divElement, editorOptions);
    decorationsCollection = editor.createDecorationsCollection([]);
    hintCollection = editor.createDecorationsCollection([]);

    editor.onMouseDown((e) => {
      if (
        e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN &&
        e.target.position?.lineNumber
      ) {
        const mouseEvent = e.event;
        if (!divElement) return;
        const rect = divElement.getBoundingClientRect();
        popupPosition = {
          top: mouseEvent.posy - rect.top
        };
        e.event.browserEvent.stopPropagation();
        showPopup = !showPopup;
        renderQuickEditHint();
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const position = editor?.getPosition();
      if (position) {
        popupPosition = {
          top:
            (editor?.getTopForLineNumber(position.lineNumber) ?? 0) - (editor?.getScrollTop() ?? 0)
        };
        showPopup = true;
      }

      renderQuickEditHint();
    });

    editor.onDidChangeCursorPosition(() => {
      renderQuickEditHint();
    });

    editor.onDidChangeModelContent(({ isFlush }) => {
      renderQuickEditHint();
      const newText = editor?.getValue();
      if (!newText || currentText === newText || isFlush) {
        return;
      }
      currentText = newText;
      onUpdate(currentText);
    });

    const unsubscribeState = stateStore.subscribe(({ errorMarkers, editorMode, code, mermaid }) => {
      if (!editor) {
        return;
      }

      const model = editorMode === 'code' ? mermaidModel : jsonModel;

      if (editor.getModel()?.id !== model.id) {
        editor.setModel(model);
        renderQuickEditHint();
      }

      // Clear decorations if not in 'code' mode, or if the model changes
      if (editorMode !== 'code' || editor.getModel()?.id !== mermaidModel.id) {
        decorationsCollection?.clear();
      }

      // Update editor text if it's different
      const newText = editorMode === 'code' ? code : mermaid;
      if (newText !== currentText) {
        editor.setScrollTop(0);
        editor.setValue(newText);
        currentText = newText;
        renderQuickEditHint();
      }

      // Display/clear errors
      monaco.editor.setModelMarkers(model, 'mermaid', errorMarkers);
    });

    editor.onMouseMove((e) => {
      if (!editor) return;
      if (showPopup) return;
      if (editor.getModel()?.id !== mermaidModel.id) return;

      lastMouseLine = e.target.position?.lineNumber ?? 0;
      renderQuickEditHint();
    });

    editor.onMouseLeave(() => {
      lastMouseLine = 0;
      renderQuickEditHint();
    });

    const unsubscribeMode = mode.subscribe((mode) => {
      if (editor) {
        monaco.editor.setTheme(`mermaid${mode === 'dark' ? '-dark' : ''}`);
      }
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

    renderQuickEditHint();

    return () => {
      unsubscribeState();
      unsubscribeMode();
      resizeObserver.disconnect();
      jsonModel.dispose();
      mermaidModel.dispose();
      editor?.dispose();
    };
  });
</script>

<div class="relative h-full grow overflow-hidden" style={quickEditHintStyle}>
  <div bind:this={divElement} id="editor" class="h-full w-full"></div>
  <AIGlyphPopup
    top={popupPosition.top}
    show={showPopup}
    bind:suggestion
    onClose={() => {
      showPopup = false;
      suggestion = '';
      renderQuickEditHint();
    }}
    onTryFree={() => {
      window.open($urlsStore.mermaidChart({ medium: 'vibe_diagramming' }).save, '_blank');
      showPopup = false;
      suggestion = '';
      renderQuickEditHint();
    }} />
</div>

<style>
  :global(.quick-edit-hint::after) {
    content: var(--quick-edit-hint-text);
    color: #a1a1aa;
    font-size: small;
    pointer-events: none;
    user-select: none;
    margin-left: 4px;
    opacity: 0.6;
  }

  :global(.suggestion-icon) {
    background-color: #e8eaf9;
    width: 20px !important;
    height: 20px !important;
    margin-left: 4px;
    background-image: url('/icons/use-chat.svg');
    background-size: 16px 16px;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
