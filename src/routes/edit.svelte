<script lang="ts">
	import Editor from '$lib/components/editor/editor.svelte';
	import Navbar from '$lib/components/navbar.svelte';
	import Preset from '$lib/components/preset.svelte';
	import Actions from '$lib/components/actions.svelte';
	import View from '$lib/components/view.svelte';
	import Card from '$lib/components/card/card.svelte';
	import History from '$lib/components/history/history.svelte';
	import { updateCode, updateConfig, codeStore, base64State } from '$lib/util/state';
	import { initHandler } from '$lib/util/util';
	import { errorStore } from '$lib/util/error';
	import { onMount } from 'svelte';
	import type monaco from 'monaco-editor';
	import type { Mermaid } from 'mermaid';
	import { goto } from '$app/navigation';

	const mermaid: Mermaid = (window.mermaid as unknown) as Mermaid;
	let selectedMode = 'code';
	const languageMap = {
		code: 'mermaid',
		config: 'json'
	};
	let text: string = '';
	let language: 'mermaid' | 'json' = 'mermaid';
	let errorMarkers: monaco.editor.IMarkerData[] = [];
	$: language = languageMap[selectedMode];
	$: {
		if ($codeStore.updateEditor) {
			if (selectedMode === 'code') {
				text = $codeStore.code;
			} else {
				text = $codeStore.mermaid;
			}
		}
	}
	const tabSelectHandler = (message: CustomEvent<Tab>) => {
		$codeStore.updateEditor = true;
		selectedMode = message.detail.id;
	};
	const tabs: Tab[] = [
		{
			id: 'code',
			title: 'Code'
		},
		{
			id: 'config',
			title: 'Config'
		}
	];

	const handleCodeUpdate = async (code: string): Promise<void> => {
		mermaid.parse(code);
		updateCode(code, false);
	};

	const handleConfigUpdate = (config: string): void => {
		JSON.parse(config);
		updateConfig(config, false);
	};

	const syncDiagram = () => {
		$codeStore.updateDiagram = true;
	};

	const updateHandler = async (message: CustomEvent<EditorUpdateEvent>) => {
		try {
			if (selectedMode === 'code') {
				await handleCodeUpdate(message.detail.text);
			} else {
				handleConfigUpdate(message.detail.text);
			}
			errorStore.set(undefined);
			errorMarkers = [];
		} catch (e) {
			errorStore.set(e);
			if (e.hash) {
				const marker: monaco.editor.IMarkerData = {
					severity: 8, //Error
					startLineNumber: e.hash.loc.first_line,
					startColumn: e.hash.loc.first_column,
					endLineNumber: e.hash.loc.last_line,
					endColumn: e.hash.loc.last_column + 1,
					message: e.str
				};
				errorMarkers.push(marker);
				// Clear all previous errors before this error.
				errorMarkers = errorMarkers.filter(
					(m) => m.startLineNumber >= marker.startLineNumber && m.startColumn >= marker.startColumn
				);
			}
			console.error(e);
		}
	};

	const viewDiagram = async () => {
		await goto(`/view#${$base64State}`, { replaceState: true });
	};
	onMount(initHandler);
</script>

<svelte:head>
	<title>Edit</title>
</svelte:head>
<div class="h-full flex flex-col overflow-hidden bg-gray-100">
	<Navbar />
	<div class="flex-1 flex overflow-hidden">
		<div class="w-2/5 flex flex-col">
			<Card on:select={tabSelectHandler} {tabs} isCloseable={false} title="Mermaid">
				<div slot="actions">
					{#if !$codeStore.autoSync}
						<button class="bg-indigo-500 hover:bg-indigo-700 rounded px-1" on:click={syncDiagram}
							>🔄</button>
					{/if}
					<label for="autoSync">
						<input type="checkbox" name="autoSync" bind:checked={$codeStore.autoSync} />
						Auto sync
					</label>
				</div>

				<Editor on:update={updateHandler} {language} {text} {errorMarkers} />
			</Card>

			<div class="flex-1">
				<Preset />
				<History />
				<Actions />
			</div>
		</div>

		<div class="flex-1 flex flex-col  overflow-hidden">
			<Card title="Diagram" isCloseable={false}>
				<button
					slot="actions"
					class="rounded shadow px-2 bg-indigo-500 hover:bg-indigo-700"
					on:click|stopPropagation={() => viewDiagram()}>View</button>

				<div class="flex-1 overflow-auto">
					<View />
				</div>
			</Card>
		</div>
	</div>
</div>
