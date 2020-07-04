<script>
import { codeStore, updateCodeStore } from '../code-store.js';
import { configErrorStore } from '../config-error-store.js';
import { onMount } from 'svelte';
import {push, pop, replace} from 'svelte-spa-router'
import { Base64 } from 'js-base64'
// import mermaid from '@mermaid-js/mermaid';
import mermaid from '@mermaid';
import Error from './Error.svelte';
import { initEditor } from './editor-utils';

import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

export let conf = '';
export let code = '';
export let error = false;

let edit;
let editorElem = null;

let decorations = [];
const decArr = [];

let oldConf =  { theme: 'default' };
const handleConfUpdate =  conf => {
	try {
		JSON.parse(conf);
		console.log(code);
		let newState = { code, mermaid: JSON.parse(conf) };
		oldConf = newState.mermaid;
		updateCodeStore(newState);
		configErrorStore.set(undefined);
		const model = edit.getModel();
		// model.setValue(conf);
		// model.dispose();
	} catch(e) {
		console.log('Error in parsed', e);
		configErrorStore.set(e);
		const str = JSON.stringify({ code, mermaid: oldConf });
		replace('/edit/' + Base64.encodeURI(str))
	}
};

const unsubscribe = codeStore.subscribe( state => {
	if(editorElem === null) {
		console.log('Starting stuff', document.getElementById('editor-conf'));
		editorElem = document.getElementById('editor-conf');
	}
	if(!conf && state) {
		conf = JSON.stringify(state.mermaid, null, 2);
	}
	if(state) {
		code = state.code;
	}
	if(!edit && conf && (editorElem!==null)) {
		edit = monaco.editor.create(editorElem, {
			value: [
				conf,
			].join('\n'),
			theme: 'myCoolTheme',
			language: 'JSON'
		});

		let decorations = [];
		edit.onDidChangeModelContent(function (e) {
			const conf = edit.getValue();
			handleConfUpdate(conf);
		});
		handleConfUpdate(conf);
	}
});

initEditor(monaco);

const unsubscribeError = configErrorStore.subscribe( _error => {
	// console.log('Error ideintified' + _error.toString());
	if(_error) {
		error = _error.toString();
	} else {
		error = false;
	}
});


onMount(async () => {
	console.log('Mounting config');
	self.MonacoEnvironment = {
		getWorkerUrl: function (moduleId, label) {
			return './editor.worker.bundle.js';
		}
	}
});

</script>

<style>
	#editor-container {}
	#editor-conf {
		width: 100%;
		height: 200px;
		max-height: 300px;
		flex: 1;
	}
</style>

<div id="editor-container">
	<div id="editor-conf"> </div>
	{#if error}
		<Error 	errorText={error}/>
	{/if}
</div>
