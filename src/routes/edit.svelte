<script context="module">
	export const ssr = false;
	// import mermaid from 'mermaid';
</script>

<script lang="ts">
	import Editor from '$lib/Editor/index.svelte';
	import View from '$lib/View/index.svelte';
	import Card from '$lib/Card/index.svelte';
	import Tabs from '$lib/Tabs/index.svelte';
	import { initURLSubscription, updateCode, updateConfig, codeStore } from '$lib/Util/state';
	import { loadStateFromURL } from '$lib/Util/util';
	import { errorStore } from '$lib/Util/error';

	let selectedMode = 'code';
	let autoSync = true;
	const languageMap = {
		code: 'mermaid',
		config: 'json'
	};
	let text: string = '';
	let language: 'mermaid' | 'json' = 'mermaid';
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

	const handleCodeUpdate = (code: string): void => {
		updateCode(code, false);
	};

	const handleConfigUpdate = (config: string): void => {
		updateConfig(config, false);
	};

	let editorText: string = '';
	const syncDiagram = () => {
		try {
			if (selectedMode === 'code') {
				handleCodeUpdate(editorText);
			} else {
				handleConfigUpdate(editorText);
			}
		} catch (e) {
			errorStore.set(e);
		}
	};

	const updateHandler = (message: CustomEvent<EditorUpdateEvent>) => {
		editorText = message.detail.text;
		if (autoSync) {
			syncDiagram();
		}
	};
	loadStateFromURL();
	initURLSubscription();
</script>

<svelte:head>
	<title>Edit</title>
</svelte:head>

<div class="flex">
	<div class="w-2/5 h-screen flex flex-col gap-6">
		<Card class="h-1/2">
			<div slot="title">
				<div class="flex">
					<div class="flex"><Tabs on:select={tabSelectHandler} {tabs} /></div>
					<div class="flex-grow" />
					<div class="flex gap-x-4 text-white">
						{#if !autoSync}
							<button on:click={syncDiagram}>↻ Sync</button>
						{/if}
						<label for="autoSync">
							<input type="checkbox" name="autoSync" bind:checked={autoSync} />
							Auto
						</label>
					</div>
				</div>
			</div>

			<Editor on:update={updateHandler} {language} {text} />
		</Card>
	</div>

	<div class="w-3/5 h-screen">
		<Card class="h-full">
			<div slot="title" class="text-white">Diagram</div>
			<View /></Card
		>
	</div>
</div>
