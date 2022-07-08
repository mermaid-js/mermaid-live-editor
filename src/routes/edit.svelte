<script lang="ts">
	import Editor from '$lib/components/editor.svelte';
	import Navbar from '$lib/components/navbar.svelte';
	import Preset from '$lib/components/preset.svelte';
	import Actions from '$lib/components/actions.svelte';
	import View from '$lib/components/view.svelte';
	import Card from '$lib/components/card/card.svelte';
	import History from '$lib/components/history/history.svelte';
	import { updateCode, updateConfig, inputStateStore, stateStore } from '$lib/util/state';
	import { initHandler, syncDiagram } from '$lib/util/util';
	import { onMount } from 'svelte';
	import type { EditorUpdateEvent, State, Tab, DocConfig } from '$lib/types';
	import { base } from '$app/paths';

	type Modes = 'code' | 'config';
	type Languages = 'mermaid' | 'json';

	let selectedMode: Modes = 'code';
	const languageMap: { [key in Modes]: Languages } = {
		code: 'mermaid',
		config: 'json'
	};
	const docURLBase = 'https://mermaid-js.github.io/mermaid';
	const docMap: DocConfig = {
		graph: {
			code: '/#/flowchart',
			config: '/#/flowchart?id=configuration'
		},
		flowchart: {
			code: '/#/flowchart',
			config: '/#/flowchart?id=configuration'
		},
		sequenceDiagram: {
			code: '/#/sequenceDiagram',
			config: '/#/sequenceDiagram?id=configuration'
		},
		classDiagram: {
			code: '/#/classDiagram',
			config: '/#/classDiagram?id=configuration'
		},
		'stateDiagram-v2': {
			code: '/#/stateDiagram'
		},
		gantt: {
			code: '/#/gantt',
			config: '/#/gantt?id=configuration'
		},
		pie: {
			code: '/#/pie'
		},
		erDiagram: {
			code: '/#/entityRelationshipDiagram',
			config: '/#/entityRelationshipDiagram?id=styling'
		},
		journey: {
			code: '/#/user-journey'
		},
		gitGraph: {
			code: '/#/gitgraph',
			config: '/#/gitgraph?id=gitgraph-specific-configuration-options'
		}
	};
	let text = '';
	let docURL = docURLBase;
	let language: Languages = 'mermaid';
	$: language = languageMap[selectedMode];
	$: {
		if (selectedMode === 'code') {
			text = $stateStore.code;
		} else {
			text = $stateStore.mermaid;
		}
	}

	stateStore.subscribe((state: State) => {
		if (state.updateEditor) {
			text = selectedMode === 'code' ? state.code : state.mermaid;
		}
		const codeTypeMatch = /([\S]+)[\s\n]/.exec(state.code);
		if (codeTypeMatch && codeTypeMatch.length > 1) {
			const docKey = codeTypeMatch[1];
			const docConfig = docMap[docKey] ?? { code: '' };
			docURL = docURLBase + (docConfig[selectedMode] ?? docConfig.code ?? '');
		}
	});
	const tabSelectHandler = (message: CustomEvent<Tab>) => {
		selectedMode = message.detail.id === 'code' ? 'code' : 'config';
		$inputStateStore.updateEditor = true;
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

	const updateHandler = (message: CustomEvent<EditorUpdateEvent>) => {
		const code = message.detail.text;
		if (selectedMode === 'code') {
			updateCode(code, {
				updateEditor: false
			});
		} else {
			updateConfig(code, false);
		}
	};

	onMount(async () => {
		await initHandler();
		const resizer = document.getElementById('resizeHandler');
		const element = document.getElementById('editorPane');
		const resize = (e: { pageX: number }) => {
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
						<div class="form-control flex-row items-center">
							<label class="cursor-pointer label" for="autoSync">
								<span> Auto sync</span>
								<input
									type="checkbox"
									class="toggle {$stateStore.autoSync ? 'btn-secondary' : 'toggle-primary'} ml-1"
									id="autoSync"
									bind:checked={$inputStateStore.autoSync} />
							</label>
						</div>

						{#if !$stateStore.autoSync}
							<button
								class="btn btn-secondary btn-xs mr-1"
								title="Sync Diagram"
								data-cy="sync"
								on:click={syncDiagram}><i class="fas fa-sync" /></button>
						{/if}

						<button class="btn btn-secondary btn-xs" title="View documentation">
							<a target="_blank" href={docURL} data-cy="docs"><i class="fas fa-book mr-1" />Docs</a>
						</button>
					</div>
				</div>

				<Editor on:update={updateHandler} {language} bind:text />
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
				<a
					href={`${base}/view#${$stateStore.serialized}`}
					target="_blank"
					slot="actions"
					class="btn btn-secondary btn-xs"
					title="View diagram in new page"
					><i class="fas fa-external-link-alt mr-1" />Full screen</a>

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
