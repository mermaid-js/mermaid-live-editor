<script lang="ts">
	import Card from '$lib/components/card/card.svelte';
	import { codeStore, getStateString } from '$lib/util/state';
	import {
		addHistoryEntry,
		autoHistoryMode,
		clearHistoryData,
		getPreviousState,
		historyStore
	} from './history';
	import { notify, prompt } from '$lib/util/notify';
	import { onMount } from 'svelte';
	import moment from 'moment';
	import type { State, Tab } from '$lib/types';

	const HISTORY_SAVE_INTERVAL = 60000;

	const tabSelectHandler = (message: CustomEvent<Tab>) => {
		autoHistoryMode.set('timeline' === message.detail.id);
	};
	const tabs: Tab[] = [
		{
			id: 'saved',
			title: 'Saved',
			icon: 'far fa-bookmark'
		},
		{
			id: 'timeline',
			title: 'Timeline',
			icon: 'fas fa-history'
		}
	];

	const saveHistory = (auto = false) => {
		const currentState: string = getStateString();
		const previousState: string = getPreviousState(auto);
		if (previousState !== currentState) {
			addHistoryEntry({
				state: $codeStore,
				time: Date.now(),
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

	const relativeTime = (time: number) => {
		const t = new Date(time);
		return `${new Date(t).toLocaleString()} (${moment(t).fromNow()})`;
	};

	onMount(() => {
		autoHistoryMode.set(false);
		setInterval(() => {
			saveHistory(true);
		}, HISTORY_SAVE_INTERVAL);
	});

	let isOpen = true;
</script>

<Card on:select={tabSelectHandler} bind:isOpen {tabs} title="History">
	<div slot="actions">
		<button
			id="saveHistory"
			class="btn"
			on:click|stopPropagation={() => saveHistory()}
			title="Save current state"><i class="far fa-save" /></button>
		<button
			id="clearHistory"
			class="btn text-red-400"
			on:click|stopPropagation={() => clearHistory()}
			title="Delete all saved states"><i class="fas fa-trash-alt" /></button>
	</div>
	<ul class="p-2 space-y-2 overflow-auto h-56" id="historyList">
		{#if $historyStore.length > 0}
			{#each $historyStore as { state, time, name }}
				<li class="rounded p-2 shadow flex-col">
					<div class="flex">
						<div class="flex-1">
							<div class="flex flex-col">
								<span>{name}</span>
								<span class="text-gray-400 text-sm">{relativeTime(time)}</span>
							</div>
						</div>
						<div class="flex gap-2 content-center">
							<button
								class="rounded px-2 w-24 bg-green-200 hover:bg-green-300"
								on:click={() => restoreHistory(state)}><i class="fas fa-undo" /> Restore</button>
							<button
								class="rounded px-2 w-24 bg-red-200 hover:bg-red-300"
								on:click={() => clearHistory(time)}><i class="fas fa-trash-alt" /> Delete</button>
						</div>
					</div>
				</li>
			{/each}
		{:else}
			<div class="m-2 text-gray-600">
				No items in History<br />
				Click the Save button to save current state and restore it later.<br />
				Timeline will automatically be saved every minute.
			</div>
		{/if}
	</ul>
</Card>
