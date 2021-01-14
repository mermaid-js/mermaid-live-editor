<script>
  import { codeStore, updateConfig } from '../code-store.js';
  import { configErrorStore } from '../error-store.js';
  import { onMount } from 'svelte';
  import { replace } from 'svelte-spa-router';
  import { Base64 } from 'js-base64';
  import Error from './Error.svelte';
  import { getResizeHandler, initEditor } from './editor-utils';
  import { watchResize } from 'svelte-watch-resize';
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

  export let conf = '';
  export let code = '';

  let edit;
  let editorElem = null;

  let resizeHandler = () => {};

  let oldConf = {};
  const handleConfUpdate = (conf) => {
    try {
      console.log(conf);
      updateConfig(JSON.parse(conf));
      configErrorStore.set(undefined);
      const model = edit.getModel();
    } catch (e) {
      console.log('Error in parsed', e);
      configErrorStore.set(e);
      const str = JSON.stringify({ code, mermaid: oldConf });
      replace('/edit/' + Base64.encodeURI(str));
    }
  };

  const unsubscribe = codeStore.subscribe((state) => {
    if (editorElem === null) {
      console.log('Starting stuff', document.getElementById('editor-conf'));
      editorElem = document.getElementById('editor-conf');
    }
    if (!conf && state) {
      conf = JSON.stringify(state.mermaid, null, 2) || '{}';
    }
    if (state) {
      code = state.code;
    }
    if (!edit && conf && editorElem !== null) {
      edit = monaco.editor.create(editorElem, {
        value: [conf].join('\n'),
        theme: 'myCoolTheme',
        language: 'JSON',
      });
      resizeHandler = getResizeHandler(edit);
      edit.onDidChangeModelContent(function (e) {
        const conf = edit.getValue();
        handleConfUpdate(conf);
      });
      handleConfUpdate(conf);
    }
  });

  initEditor(monaco);

  onMount(async () => {
    console.log('Mounting config');
    self.MonacoEnvironment = {
      getWorkerUrl: function (moduleId, label) {
        return './editor.worker.bundle.js';
      },
    };
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
