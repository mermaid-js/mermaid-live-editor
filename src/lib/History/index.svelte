<script lang="ts">
	import Tabs from '$lib/Tabs/index.svelte';
	import Card from '$lib/Card/index.svelte';
	import { codeStore, getStateString } from '$lib/Util/state';
	import {
		addHistoryEntry,
		autoHistoryMode,
		clearHistoryData,
		getPreviousState,
		historyStore
	} from './history';
	import { notify, prompt } from '$lib/Util/notify';
	import { onMount } from 'svelte';

	const HISTORY_SAVE_INTERVAL: number = 60000;

	const tabSelectHandler = (message: CustomEvent<Tab>) => {
		autoHistoryMode.set('timeline' === message.detail.id);
	};
	const tabs: Tab[] = [
		{
			id: 'saved',
			title: 'Saved'
		},
		{
			id: 'timeline',
			title: 'Timeline'
		}
	];

	const saveHistory = (auto = false) => {
		const currentState: string = getStateString();
		const previousState: string = getPreviousState(auto);
		if (previousState !== currentState) {
			addHistoryEntry({
				state: $codeStore,
				time: Date.now(),
				name: 'test',
				auto
			});
		} else if (!auto) {
			notify('State already saved.');
		}
	};

	const clearHistory = (date?: number): void => {
		if (!date && !prompt('Clear all saved items?')) {
			return;
		}
		clearHistoryData(date);
	};

	const restoreHistory = (state: State): void => {
		codeStore.set({ ...state, updateEditor: true, updateDiagram: true });
	};

	onMount(() => {
		autoHistoryMode.set(false);
		setInterval(() => {
			saveHistory(true);
		}, HISTORY_SAVE_INTERVAL);
	});
</script>

<Card class="h-1/2">
	<div slot="title" class="flex">
		<div class="flex"><Tabs on:select={tabSelectHandler} {tabs} /></div>
		<div class="flex-grow" />
		<div class="flex gap-x-4 text-white">
			<button class="bg-yellow-500 hover:bg-yellow-700 rounded px-1" on:click={() => saveHistory()}
				>💾</button
			>
			<button class="bg-yellow-500 hover:bg-yellow-700 rounded px-1" on:click={() => clearHistory()}
				>❌</button
			>
		</div>
	</div>
	<ul class="p-2 space-y-2">
		{#each $historyStore as { state, time, name }}
			<li class="rounded p-2 shadow block">
				{new Date(time)}
				{name}
				<button on:click={() => restoreHistory(state)}>Restore</button>
				<button on:click={() => clearHistory(time)}>Delete</button>
			</li>
		{/each}
	</ul>
</Card>
