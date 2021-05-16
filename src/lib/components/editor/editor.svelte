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
		language: language,
		scrollBeyondLastLine: false,
		minimap: {
			enabled: false
		},
		overviewRulerLanes: 0
	};
	export let errorMarkers: monaco.editor.IMarkerData[] = [];
	$: Monaco?.editor.setModelLanguage(editor.getModel(), language);
	$: editor?.setValue(text);
	$: {
		Monaco?.editor.setModelMarkers(editor.getModel(), 'test', errorMarkers);
		console.log(errorMarkers);
	}

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

		editor = Monaco.editor.create(divEl, editorOptions);
		editor.onDidChangeModelContent(async () => {
			dispatch('update', {
				text: editor.getValue()
			});
		});

		const resizeObserver = new ResizeObserver((entries) => {
			editor.layout({
				height: entries[0].contentRect.height,
				width: entries[0].contentRect.width
			});
		});

		resizeObserver.observe(divEl.parentElement);
		return () => {
			editor.dispose();
		};
	});
</script>

<div bind:this={divEl} class="overflow-hidden" />
