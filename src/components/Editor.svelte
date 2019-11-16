<script>
import { codeStore, updateCodeStore } from '../code-store.js';
import { errorStore } from '../error-store.js';
import { onMount } from 'svelte';
import {push, pop, replace} from 'svelte-spa-router'
import { Base64 } from 'js-base64'
import mermaid from 'mermaid';
import Error from './Error.svelte';
import { initEditor } from './editor-utils';
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

export let data;
export let code = '';
let edit;

let decorations = [];
const decArr = [];
const handleCodeUpdate = code => {
	try {
		mermaid.parse(code);
		let newState = { code, mermaid: { theme: 'default' } };
		updateCodeStore(newState);
		decArr.forEach(decor => {
			edit.deltaDecorations(decor, []);
		});
		// decorations = edit.deltaDecorations(decorations, [{ range: new monaco.Range(1,1,1,1), options : { } }]);
		errorStore.set(undefined);
		const model = edit.getModel();
		// model.setValue(code);
		// model.dispose();
	} catch(e) {
		console.log('Error in parsed', e);
		errorStore.set(e);
		const str = JSON.stringify({ code: code, mermaid: { theme: 'default' } });
		push('/edit/' + Base64.encode(str))
		const l = e.hash.line;
		decArr.push(edit.deltaDecorations([], [
			{ range: new monaco.Range(e.hash.loc.first_line,e.hash.loc.last_line,e.hash.loc.first_column,e.hash.loc.last_column), options: { inlineClassName: 'myInlineDecoration' }}]
		));
		// const model = edit.getModel();

		// monaco.editor.setModelMarkers(model, 'test', {
		// 	startLineineNumber: e.hash.loc.first_line,
		// 	endLineNumumber: e.hash.loc.last_line,
		// 	startColumn: e.hash.loc.first_column,
		// 	endColumn: e.hash.loc.last_column,
		// 	message: 'Syntax error',
		// 	code: 'SXE',
		// 	severity: 8
		// });
	}
};

const unsubscribe = codeStore.subscribe( state => {
	if(!code && state) {
		code = state.code;
	}
	if(!edit && code) {
		edit = monaco.editor.create(document.getElementById('editor'), {
			value: [
				code,
			].join('\n'),
			theme: 'myCoolTheme',
			language: 'mermaid'
		});

		let decorations = [];
		edit.onDidChangeModelContent(function (e) {
			const code = edit.getValue();
			handleCodeUpdate(code);
		});
		handleCodeUpdate(code);
	}
});

initEditor(monaco);

onMount(async () => {
	console.log('Mounting editor');
	self.MonacoEnvironment = {
		getWorkerUrl: function (moduleId, label) {
			return './editor.worker.bundle.js';
		}
	}
});

	export let name;
	export let params = {}
</script>

<style>
	#editor-container {
		height: 80%;
		max-height: 400px;
		border: 1px solor darkred;
		flex: 1;
	}
	#editor {
		height: 80%;
		max-height: 400px;
		border: 1px solor darkred;
		flex: 1;
	}

	/* .myLineDecoration {
		background: lightblue;
		width: 50px !important;
		margin-left: 3px;
	} */
</style>

<div id="editor-container">
	<div id="editor"> </div>
	<Error />
</div>
