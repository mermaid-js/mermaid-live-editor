<script lang="ts">
	import type { EditorEvents } from '$lib/types';
	import { stateStore } from '$lib/util/state';
	import { themeStore } from '$lib/util/theme';
	import 'monaco-editor';
	import type monaco from 'monaco-editor';
	import { createEventDispatcher, onMount } from 'svelte';
	import initEditor from 'monaco-mermaid';

	let divEl: HTMLDivElement;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco: typeof monaco;

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
	let oldText = text;
	$: editor && Monaco.editor.setModelLanguage(editor.getModel(), language);
	$: {
		if (text !== oldText) {
			if (editor && $stateStore.updateEditor) {
				editor.setValue(text);
			}
			oldText = text;
		}
		editor && Monaco.editor.setModelMarkers(editor.getModel(), 'test', $stateStore.errorMarkers);
	}

	themeStore.subscribe(({ isDark }) => {
		editor && Monaco.editor.setTheme(isDark ? 'mermaid-dark' : 'mermaid');
	});

	const dispatch = createEventDispatcher<EditorEvents>();

	onMount(async () => {
		// @ts-ignore
		self.MonacoEnvironment = {
			getWorker: function (workerId: string, label: string) {
				const getWorkerModule = (moduleUrl: string, label: string): Worker => {
					// @ts-ignore
					return new Worker(self.MonacoEnvironment.getWorkerUrl(moduleUrl), {
						name: label,
						type: 'module'
					});
				};

				switch (label) {
					case 'json':
						return getWorkerModule('/monaco-editor/esm/vs/language/json/json.worker?worker', label);
					case 'css':
					case 'scss':
					case 'less':
						return getWorkerModule('/monaco-editor/esm/vs/language/css/css.worker?worker', label);
					case 'html':
					case 'handlebars':
					case 'razor':
						return getWorkerModule('/monaco-editor/esm/vs/language/html/html.worker?worker', label);
					case 'typescript':
					case 'javascript':
						return getWorkerModule(
							'/monaco-editor/esm/vs/language/typescript/ts.worker?worker',
							label
						);
					default:
						return getWorkerModule('/monaco-editor/esm/vs/editor/editor.worker?worker', label);
				}
			}
		};

		Monaco = await import('monaco-editor');
		initEditor(Monaco);
		editor = Monaco.editor.create(divEl, editorOptions);
		editor.onDidChangeModelContent(() => {
			text = editor.getValue();
			dispatch('update', {
				text
			});
		});
		Monaco.editor.setTheme($themeStore.isDark ? 'mermaid-dark' : 'mermaid');
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

<div bind:this={divEl} id="editor" class="overflow-hidden min-h-12" />
