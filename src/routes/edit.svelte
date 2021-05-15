<script lang="ts">
	import Editor from '$lib/Editor/index.svelte';
	import View from '$lib/View/index.svelte';
	import Card from '$lib/Card/index.svelte';
	import Tabs from '$lib/Tabs/index.svelte';
	import History from '$lib/History/index.svelte';
	import { initURLSubscription, updateCode, updateConfig, codeStore } from '$lib/Util/state';
	import { loadStateFromURL } from '$lib/Util/util';
	import { errorStore } from '$lib/Util/error';
	import { onMount } from 'svelte';
	import type monaco from 'monaco-editor';
	import type { Mermaid } from 'mermaid';

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
	loadStateFromURL();

	onMount(() => {
		syncDiagram();
		initURLSubscription();
	});
</script>

<svelte:head>
	<title>Edit</title>
</svelte:head>

<div class="flex">
	<div class="w-2/5 h-screen flex flex-col gap-6">
		<Card class="h-1/2">
			<div slot="title" class="flex">
				<div class="flex"><Tabs on:select={tabSelectHandler} {tabs} /></div>
				<div class="flex-grow" />
				<div class="flex gap-x-4 text-white">
					{#if !$codeStore.autoSync}
						<button class="bg-blue-500 hover:bg-blue-700 rounded px-1" on:click={syncDiagram}
							>🔄</button
						>
					{/if}
					<label for="autoSync">
						<input type="checkbox" name="autoSync" bind:checked={$codeStore.autoSync} />
						Auto sync
					</label>
				</div>
			</div>

			<Editor on:update={updateHandler} {language} {text} {errorMarkers} />
		</Card>
		<History />
	</div>

	<div class="w-3/5 h-3/5">
		<Card class="h-full">
			<div slot="title" class="text-white">Diagram</div>
			<View />
		</Card>
	</div>
</div>
