<script lang="ts">
	import type { EditorEvents } from '$lib/types';
	import { codeStore } from '$lib/util/state';
	import { themeStore } from '$lib/util/theme';
	import type monaco from 'monaco-editor';
	import { createEventDispatcher, onMount } from 'svelte';
	import initEditor from 'monaco-mermaid';

	let divEl: HTMLDivElement = null;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco;

	export let text: string;
	export let language: string;
	export let editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
		value: text,
		language: language,
		minimap: {
			enabled: false
		},
		theme: 'mermaid',
		overviewRulerLanes: 0
	};
	export let errorMarkers: monaco.editor.IMarkerData[] = [];
	let oldText = text;
	$: editor && Monaco?.editor.setModelLanguage(editor.getModel(), language);
	$: {
		if (text !== oldText) {
			if ($codeStore.updateEditor) {
				editor?.setValue(text);
			}
			oldText = text;
		}
		editor && Monaco?.editor.setModelMarkers(editor.getModel(), 'test', errorMarkers);
	}

	themeStore.subscribe(({ isDark }) => {
		editor && Monaco?.editor.setTheme(isDark ? 'mermaid-dark' : 'mermaid');
	});

	const dispatch = createEventDispatcher<EditorEvents>();
	const loadMonaco = async () => {
		let i = 0;
		while (i++ < 10) {
			try {
				// @ts-ignore : This is a hack to handle a svelte-kit error when importing monaco.
				Monaco = monaco;
				return;
			} catch {
				await new Promise((r) => setTimeout(r, 500));
			}
		}
		alert('Loading Monaco Editor failed. Please try refreshing the page.');
	};
	onMount(async () => {
		try {
			// @ts-ignore : This is a hack to handle a svelte-kit error when importing monaco.
			Monaco = monaco;
		} catch {
			await loadMonaco(); // Fix https://github.com/mermaid-js/mermaid-live-editor/issues/175
		}
		initEditor(Monaco);
		editor = Monaco.editor.create(divEl, editorOptions);
		editor.onDidChangeModelContent(() => {
			text = editor.getValue();
			dispatch('update', {
				text
			});
		});
		Monaco?.editor.setTheme($themeStore.isDark ? 'mermaid-dark' : 'mermaid');
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

<div bind:this={divEl} id="editor" class="overflow-hidden" />
