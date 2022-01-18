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
	import mermaid from 'mermaid';
	import type monaco from 'monaco-editor';
	import type { EditorUpdateEvent, State, Tab } from '$lib/types';
	import { base } from '$app/paths';

	base64State; // Weird fix for error > base64State is not defined. Treeshaking?
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

	const handleCodeUpdate = (code: string): void => {
		mermaid.parse(code);
		updateCode(code, false);
	};

	const handleConfigUpdate = (config: string): void => {
		JSON.parse(config);
		updateConfig(config, false);
	};

	const updateHandler = (message: CustomEvent<EditorUpdateEvent>) => {
		try {
			if (selectedMode === 'code') {
				handleCodeUpdate(message.detail.text);
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

	const viewDiagram = () => {
		window.open(`${base}/view#${$base64State}`, '_blank').focus();
	};

	onMount(async () => {
		await initHandler();
		const resizer = document.getElementById('resizeHandler');
		const element = document.getElementById('editorPane');
		const resize = (e) => {
			const newWidth = e.pageX - element.getBoundingClientRect().left;
			if (newWidth > 50) {
				element.style.width = `${newWidth}px`;
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

<div class="h-full flex flex-col overflow-hidden">
	<Navbar />
	<div class="flex-1 flex overflow-hidden">
		<div class="hidden md:flex flex-col" id="editorPane" style="width: 40%">
			<Card on:select={tabSelectHandler} {tabs} isCloseable={false} title="Mermaid">
				<div slot="actions">
					<div class="flex flex-row items-center">
						{#if !$codeStore.autoSync}
							<button
								class="btn btn-secondary btn-xs"
								title="Sync Diagram"
								data-cy="sync"
								on:click={syncDiagram}><i class="fas fa-sync" /></button>
						{/if}

						<div class="form-control">
							<label class="cursor-pointer label" for="autoSync">
								<input
									type="checkbox"
									class="toggle toggle-primary mr-1"
									id="autoSync"
									bind:checked={$codeStore.autoSync} />
								<span> Auto sync</span>
							</label>
						</div>
					</div>
				</div>

				<Editor on:update={updateHandler} {language} bind:text {errorMarkers} />
			</Card>

			<div class="-mt-2">
				<Preset />
				<History />
				<Actions />
			</div>
		</div>
		<div id="resizeHandler" class="hidden md:block" />
		<div class="flex-1 flex flex-col overflow-hidden">
			<Card title="Diagram" isCloseable={false}>
				<button
					slot="actions"
					class="btn btn-primary btn-xs shadow-lg"
					title="View diagram in new page"
					on:click|stopPropagation={() => viewDiagram()}><i class="far fa-eye mr-2" /> View</button>

				<div class="flex-1 overflow-auto">
					<View />
				</div>
			</Card>
			<div class="md:hidden rounded shadow p-2 mx-2">
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
		background-color: hsla(var(--b3));
		margin-left: -1px;
		transition-duration: 0.2s;
	}

	#resizeHandler:hover::after {
		margin-left: -2px;
		background-color: hsla(var(--p));
		width: 4px;
	}
</style>
