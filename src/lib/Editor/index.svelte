<script lang="ts">
	import type monaco from 'monaco-editor';
	import { createEventDispatcher, onMount } from 'svelte';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { initEditor } from './util';

	let divEl: HTMLDivElement = null;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco;

	export let text: string;
	export let language: string;
	export let editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
		value: text,
		language: language
	};

	$: Monaco?.editor.setModelLanguage(editor.getModel(), language);
	$: editor?.setValue(text);

	const dispatch = createEventDispatcher<EditorEvents>();

	onMount(async () => {
		// @ts-ignore
		self.MonacoEnvironment = {
			getWorker: function (_moduleId: any, label: string) {
				if (label === 'json') {
					return new jsonWorker();
				}
				if (label === 'css' || label === 'scss' || label === 'less') {
					return new cssWorker();
				}
				if (label === 'html' || label === 'handlebars' || label === 'razor') {
					return new htmlWorker();
				}
				if (label === 'typescript' || label === 'javascript') {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};
		Monaco = await import('monaco-editor');
		initEditor(Monaco);

		// divEl = document.getElementById('editor') as HTMLDivElement;
		editor = Monaco.editor.create(divEl, editorOptions);
		editor.onDidChangeModelContent(async () => {
			dispatch('update', {
				text: editor.getValue()
			});
		});
		// editor.layout();
		return () => {
			editor.dispose();
		};
	});
</script>

<div bind:this={divEl} class="h-full" />
