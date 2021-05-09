<script lang="ts">
	import type monaco from 'monaco-editor';
	import { createEventDispatcher, onMount } from 'svelte';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	let divEl: HTMLDivElement = null;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco;
	export let editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
		value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
		language: 'javascript'
	};
	const dispatch = createEventDispatcher<EditorEvents>();
	let resizeHandler: any = () => {};

	export const getResizeHandler = (editor) => {
		return (node) => editor && editor.layout();
	};
	onMount(async () => {
		resizeHandler = getResizeHandler(divEl);
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
		editor = Monaco.editor.create(divEl, editorOptions);

		editor.onDidChangeModelContent(async () => {
			dispatch('update', {
				text: editor.getValue()
			});
		});
		editor.layout();
		return () => {
			editor.dispose();
		};
	});
</script>

<div bind:this={divEl} class="h-full" />
