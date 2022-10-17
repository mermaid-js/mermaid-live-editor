<script lang="ts">
	import type { EditorMode } from '$lib/types';
	import { stateStore, updateCode, updateConfig } from '$lib/util/state';
	import { themeStore } from '$lib/util/theme';
	import { syncDiagram } from '$lib/util/util';
	import type monaco from 'monaco-editor';
	import { onMount } from 'svelte';
	import initEditor from 'monaco-mermaid';
	import { logEvent } from '$lib/util/stats';

	let divEl: HTMLDivElement = null;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco: typeof monaco;
	let editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
		minimap: {
			enabled: false
		},
		theme: 'mermaid',
		overviewRulerLanes: 0
	};
	let text = '';

	stateStore.subscribe(({ errorMarkers, editorMode, code, mermaid }) => {
		if (!editor) return;

		// Update editor text if it's different
		const newText = editorMode === 'code' ? code : mermaid;
		if (newText !== text) {
			editor.setValue(newText);
			text = newText;
		}

		// Update editor mode if it's different
		const language = editorMode === 'code' ? 'mermaid' : 'json';
		if (editor.getModel().getLanguageId() !== language) {
			Monaco?.editor.setModelLanguage(editor.getModel(), language);
		}

		// Display/clear errors
		Monaco?.editor.setModelMarkers(editor.getModel(), 'mermaid', errorMarkers);
	});

	themeStore.subscribe(({ isDark }) => {
		editor && Monaco?.editor.setTheme(isDark ? 'mermaid-dark' : 'mermaid');
	});

	const handleUpdate = (text: string, mode: EditorMode) => {
		if (mode === 'code') {
			updateCode(text);
		} else {
			updateConfig(text);
		}
	};

	const loadMonaco = async () => {
		console.log('Loading Monaco...');
		let i = 0;
		while (i++ < 500) {
			// @ts-ignore : This is a hack to handle a svelte-kit error when importing monaco.
			Monaco = window.monaco;
			if (Monaco !== undefined) {
				return;
			}
			await new Promise((r) => setTimeout(r, 100));
		}
		alert('Loading Monaco Editor failed. Please try refreshing the page.');
	};

	onMount(async () => {
		await loadMonaco(); // Fix https://github.com/mermaid-js/mermaid-live-editor/issues/175
		initEditor(Monaco);
		editor = Monaco.editor.create(divEl, editorOptions);
		editor.onDidChangeModelContent(() => {
			text = editor.getValue();
			handleUpdate(text, $stateStore.editorMode);
		});
		editor.addAction({
			id: 'mermaid-render-diagram',
			label: 'Render Diagram',
			keybindings: [Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.Enter],
			run: function () {
				syncDiagram();
				logEvent('renderDiagram', {
					method: 'keyboadShortcut'
				});
			}
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
