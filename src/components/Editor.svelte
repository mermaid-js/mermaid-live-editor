<script>
  import { codeStore, updateCode, updateConfig } from '../code-store.js';
  import { codeErrorStore } from '../error-store.js';
  import { onMount } from 'svelte';
  import mermaid from '@mermaid';
  import Error from './Error.svelte';
  import { getResizeHandler, initEditor } from './editor-utils';
  import * as monaco from 'monaco-editor';
  import { watchResize } from 'svelte-watch-resize';
  import { getMermaidData } from '../gist-utils';
  let edit;

  const decArr = [];
  let editorElem = null;
  let resizeHandler = () => {};
  const handleCodeUpdate = (updatedCode, updateEditor) => {
    try {
      mermaid.parse(updatedCode);
      if (edit) {
        if (updateEditor) {
          edit.setValue(updatedCode);
        }
        decArr.forEach((decor) => {
          edit.deltaDecorations(decor, []);
        });
      }
      updateCode(updatedCode, false);
      codeErrorStore.set(undefined);
    } catch (e) {
      codeErrorStore.set('Syntax Error');
      console.log('Error in parsed', e.hash);
      const l = e.hash.line;
      decArr.push(
        edit.deltaDecorations(
          [],
          [
            {
              range: new monaco.Range(
                e.hash.loc.first_line,
                e.hash.loc.last_line,
                e.hash.loc.first_column,
                e.hash.loc.last_column
              ),
              options: { inlineClassName: 'myInlineDecoration' },
            },
          ]
        )
      );
    }
  };

  const unsubscribe = codeStore.subscribe((state) => {
    if (state.updateEditor) {
      handleCodeUpdate(state.code, true);
    }
  });

  onMount(async () => {
    initEditor(monaco);
    editorElem = document.getElementById('editor');
    edit = monaco.editor.create(editorElem, {
      value: '',
      theme: 'myCoolTheme',
      language: 'mermaid',
    });
    resizeHandler = getResizeHandler(edit);
    edit.onDidChangeModelContent(function (e) {
      handleCodeUpdate(edit.getValue(), false);
    });

    initEditor(monaco);

    setTimeout(async () => {
      // https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a
      const { code, config } = await getMermaidData(
        '6268a23e673a533dcb198f241fd7012a'
      );
      console.log(code, config);
      updateCode(code, true);
      updateConfig(JSON.parse(config), true);
    }, 500);
  });
</script>

<style>
  #editor {
    width: 100%;
    height: 400px;
    max-height: 300px;
    flex: 1;
  }
</style>

<div id="editor-container">
  <div id="editor" use:watchResize={resizeHandler} />
  <Error errorStore={codeErrorStore} />
</div>
