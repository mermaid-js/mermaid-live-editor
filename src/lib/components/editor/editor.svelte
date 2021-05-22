<script lang="ts">
	import type monaco from 'monaco-editor';
	import { createEventDispatcher, onMount } from 'svelte';
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
	}

	const dispatch = createEventDispatcher<EditorEvents>();

	onMount(async () => {
		//@ts-ignore
		Monaco = monaco; // This is a hack to handle a svelte-kit error when importing monaco.
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
