<script lang="ts">
	import type { EditorMode } from '$lib/types';
	import { stateStore, updateCode, updateConfig } from '$lib/util/state';
	import { themeStore } from '$lib/util/theme';
	import { syncDiagram } from '$lib/util/util';
	import type monaco from 'monaco-editor';
	import { onMount } from 'svelte';
	import initEditor from 'monaco-mermaid';
	import { logEvent } from '$lib/util/stats';
	import { debounceEnabled } from '$lib/util/env';

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

		// Display errors if present
		if (errorMarkers.length > 0) {
			Monaco?.editor.setModelMarkers(editor.getModel(), 'test', errorMarkers);
		}
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

	// Debounce state updates to avoid performance issues
	let debounce: { [key: string]: number } = {};
	const updateHandler = (newText: string) => {
		text = newText;
		const mode = $stateStore.editorMode;
		if (debounceEnabled) {
			clearTimeout(debounce[mode]);
			debounce[mode] = window.setTimeout(() => {
				handleUpdate(text, mode);
			}, 300);
		} else {
			handleUpdate(text, mode);
		}
	};

	const loadMonaco = async () => {
		let i = 0;
		while (i++ < 500) {
			try {
				// @ts-ignore : This is a hack to handle a svelte-kit error when importing monaco.
				Monaco = window.monaco;
				return;
			} catch {
				await new Promise((r) => setTimeout(r, 100));
			}
		}
		alert('Loading Monaco Editor failed. Please try refreshing the page.');
	};

	onMount(async () => {
		await loadMonaco(); // Fix https://github.com/mermaid-js/mermaid-live-editor/issues/175
		initEditor(Monaco);
		editor = Monaco.editor.create(divEl, editorOptions);
		editor.onDidChangeModelContent(() => {
			updateHandler(editor.getValue());
		});
		editor.addAction({
			id: 'mermaid-render-diagram',
			label: 'Render Diagram',
			keybindings: [Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.Enter],
			run: function () {
				syncDiagram();
				void logEvent('renderDiagram', {
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
