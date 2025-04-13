<script lang="ts">
  import { stateStore, updateCode, updateConfig } from '$/util/state';
  import { Compartment, EditorState } from '@codemirror/state';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { EditorView } from '@codemirror/view';
  import { basicSetup } from 'codemirror';
  import { mode } from 'mode-watcher';
  import { onMount } from 'svelte';

  let editorView: EditorView;
  let editorContainer: HTMLDivElement;
  let currentText = $state(
    $stateStore.editorMode === 'code' ? $stateStore.code : $stateStore.mermaid
  );

  onMount(() => {
    const themeCompartment = new Compartment();

    editorView = new EditorView({
      state: EditorState.create({
        doc: currentText,
        extensions: [
          basicSetup,
          themeCompartment.of($mode === 'dark' ? oneDark : []),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newText = update.state.doc.toString();
              if (currentText === newText) {
                return;
              }
              currentText = newText;
              if ($stateStore.editorMode === 'code') {
                updateCode(currentText);
              } else {
                updateConfig(currentText);
              }
            }
          }),
          EditorView.theme({
            '&.cm-focused': {
              outline: 'none'
            },
            '&.cm-editor': {
              height: '100%'
            },
            '&.cm-scroller': {
              overflow: 'auto'
            }
          })
        ]
      }),
      parent: editorContainer
    });

    const unsubscribeMode = mode.subscribe((mode) => {
      editorView.dispatch({
        effects: themeCompartment.reconfigure(mode === 'dark' ? oneDark : [])
      });
    });

    return () => {
      unsubscribeMode();
      editorView?.destroy();
    };
  });

  stateStore.subscribe(({ editorMode, code, mermaid }) => {
    const text = editorMode === 'code' ? code : mermaid;
    if (currentText === text) {
      return;
    }
    currentText = text;
    editorView?.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: text
      }
    });
  });
</script>

<div bind:this={editorContainer} class="h-full w-full"></div>
