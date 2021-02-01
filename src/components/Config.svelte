<script>
  import { codeStore, updateConfig } from '../code-store.js';
  import { configErrorStore } from '../error-store.js';
  import { onMount } from 'svelte';
  import Error from './Error.svelte';
  import { getResizeHandler, initEditor } from './editor-utils';
  import { watchResize } from 'svelte-watch-resize';
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

  let edit;

  let resizeHandler = () => {};

  const handleConfUpdate = (conf, updateEditor) => {
    console.log(conf);
    if (updateEditor && edit) {
      edit.setValue(JSON.stringify(conf, null, 2));
    }
    updateConfig(conf, false);
    configErrorStore.set(undefined);
  };
  

  const unsubscribe = codeStore.subscribe((state) => {
    console.log(state.mermaid, state.updateEditor);
    if (state.updateEditor) {
      handleConfUpdate(state.mermaid, true);
    }
  });

  onMount(async () => {
    console.log('Mounting config');
    const editorElem = document.getElementById('editor-conf');
    edit = monaco.editor.create(editorElem, {
      value: '',
      theme: 'myCoolTheme',
      language: 'json',
    });
    resizeHandler = getResizeHandler(edit);
    edit.onDidChangeModelContent(function (e) {
      try {
        const conf = JSON.parse(edit.getValue());
        handleConfUpdate(conf, false);
      } catch (err) {
        console.log('Error in parsed', err);
        configErrorStore.set(err);
      }
    });

    initEditor(monaco);
  });
</script>

<style>
  #editor-conf {
    width: 100%;
    height: 200px;
    max-height: 300px;
    flex: 1;
  }
</style>

<div id="editor-container">
  <div id="editor-conf" use:watchResize={resizeHandler} />
  <Error errorStore={configErrorStore} />
</div>
