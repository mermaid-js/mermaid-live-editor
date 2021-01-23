<script>
  import { codeStore, updateCode } from '../code-store.js';
  import { codeErrorStore } from '../code-error-store.js';
  import { onMount } from 'svelte';
  import mermaid from '@mermaid';
  import Error from './Error.svelte';
  import { getResizeHandler, initEditor } from './editor-utils';
  import * as monaco from 'monaco-editor';
  import { watchResize } from 'svelte-watch-resize';


  export let code = '';
  const isDarkMode =
    window.matchMedia('(prefers-color-scheme: dark)').matches && false;
  let edit;

  const decArr = [];
  let editorElem = null;
  let resizeHandler = () => {};
  const handleCodeUpdate = (updatedCode, updateEditor) => {
    try {
      mermaid.parse(updatedCode);
      if(updateEditor){
        edit.setValue(updatedCode);
      }
      decArr.forEach((decor) => {
        edit.deltaDecorations(decor, []);
      });
      updateCode(updatedCode, false)
      codeErrorStore.set(undefined);
    } catch (e) {
      if (e) {
        codeErrorStore.set("Syntax Error");
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
    }
  };

  onMount(async () => {
    initEditor(monaco);

    editorElem = document.getElementById('editor');
    edit = monaco.editor.create(editorElem, {
      value: [code].join('\n'),
      theme: 'myCoolTheme',
      language: 'mermaid',
    });
    resizeHandler = getResizeHandler(edit);
    edit.onDidChangeModelContent(function (e) {
      handleCodeUpdate(edit.getValue(), false);
    });


    const unsubscribe = codeStore.subscribe((state) => {
      console.log(`Code change ${JSON.stringify(state)}`);
      
      if (state) {
        code = state.code || code;
      }

      if(state.updateEditor){
        handleCodeUpdate(code, true);
      }
    });

    initEditor(monaco);
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
