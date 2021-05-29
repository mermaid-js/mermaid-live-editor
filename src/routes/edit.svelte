<script lang="ts">
	import Editor from '$lib/components/editor/editor.svelte';
	import Navbar from '$lib/components/navbar.svelte';
	import Preset from '$lib/components/preset.svelte';
	import Actions from '$lib/components/actions.svelte';
	import View from '$lib/components/view.svelte';
	import Card from '$lib/components/card/card.svelte';
	import History from '$lib/components/history/history.svelte';
	import { updateCode, updateConfig, codeStore, base64State } from '$lib/util/state';
	import { initHandler, syncDiagram } from '$lib/util/util';
	import { errorStore } from '$lib/util/error';
	import { onMount } from 'svelte';
	import type monaco from 'monaco-editor';
	import type { Mermaid } from 'mermaid';
	import { goto } from '$app/navigation';
	import type { EditorUpdateEvent, State, Tab } from '$lib/types';

	const mermaid: Mermaid = (window.mermaid as unknown) as Mermaid;

	let selectedMode = 'code';
	const languageMap = {
		code: 'mermaid',
		config: 'json'
	};
	let text = '';
	let language: 'mermaid' | 'json' = 'mermaid';
	let errorMarkers: monaco.editor.IMarkerData[] = [];
	$: language = languageMap[selectedMode];
	$: {
		if (selectedMode === 'code') {
			text = $codeStore.code;
		} else {
			text = $codeStore.mermaid;
		}
	}

	codeStore.subscribe((state: State) => {
		if (state.updateEditor) {
			text = selectedMode === 'code' ? state.code : state.mermaid;
		}
	});
	const tabSelectHandler = (message: CustomEvent<Tab>) => {
		$codeStore.updateEditor = true;
		selectedMode = message.detail.id;
	};
	const tabs: Tab[] = [
		{
			id: 'code',
			title: 'Code',
			icon: 'fas fa-code'
		},
		{
			id: 'config',
			title: 'Config',
			icon: 'fas fa-cogs'
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

	onMount(() => {
		initHandler();
		const resizer = document.getElementById('resizeHandler');
		const element = document.getElementById('editorPane');
		const resize = (e) => {
			const newWidth = e.pageX - element.getBoundingClientRect().left;
			if (newWidth > 50) {
				element.style.width = newWidth + 'px';
			}
		};

		const stopResize = () => {
			window.removeEventListener('mousemove', resize);
		};
		resizer.addEventListener('mousedown', (e) => {
			e.preventDefault();
			window.addEventListener('mousemove', resize);
			window.addEventListener('mouseup', stopResize);
		});
	});
</script>

<div class="h-full flex flex-col overflow-hidden bg-gray-100">
	<Navbar />
	<div class="flex-1 flex overflow-hidden">
		<div class="hidden md:flex flex-col" id="editorPane" style="width: 40%">
			<Card on:select={tabSelectHandler} {tabs} isCloseable={false} title="Mermaid">
				<div slot="actions">
					{#if !$codeStore.autoSync}
						<button
							class="bg-indigo-500 hover:bg-indigo-700 rounded px-4 mx-2"
							title="Sync Diagram"
							data-cy="sync"
							on:click={syncDiagram}><i class="fas fa-sync" /></button>
					{/if}
					<label
						for="autoSync"
						style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
						<input type="checkbox" id="autoSync" bind:checked={$codeStore.autoSync} />
						Auto sync
					</label>
				</div>

				<Editor on:update={updateHandler} {language} bind:text {errorMarkers} />
			</Card>

			<div class="-mt-2">
				<Preset />
				<History />
				<Actions />
			</div>
		</div>
		<div id="resizeHandler" />
		<div class="flex-1 flex flex-col overflow-hidden">
			<Card title="Diagram" isCloseable={false}>
				<button
					slot="actions"
					class="btn hidden"
					title="View diagram in new page"
					on:click|stopPropagation={() => viewDiagram()}><i class="far fa-eye" /> View</button>

				<div class="flex-1 overflow-auto">
					<View />
				</div>
			</Card>
			<div class="md:hidden bg-white rounded shadow p-2 mx-2">
				Code editing not supported on mobile. Please use a desktop browser.
			</div>
		</div>
	</div>
</div>

<style>
	#resizeHandler {
		cursor: col-resize;
		padding: 0 2px;
	}

	#resizeHandler::after {
		width: 2px;
		height: 100%;
		top: 0;
		content: '';
		position: absolute;
		background-color: #ccc;
		margin-left: -1px;
	}

	#resizeHandler:hover::after {
		margin-left: -2px;
		background-color: #818cf8;
		width: 4px;
	}

	@media screen and (max-width: 768px) {
		#resizeHandler {
			display: none;
		}
	}
</style>
