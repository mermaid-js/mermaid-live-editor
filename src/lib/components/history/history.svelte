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
		<button class="btn" on:click|stopPropagation={() => saveHistory()}>💾</button>
		<button class="btn" on:click|stopPropagation={() => clearHistory()}>❌</button>
	</div>
	<ul class="p-2 space-y-2 overflow-auto h-56">
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
							on:click={() => restoreHistory(state)}>Restore</button>
						<button
							class="rounded px-2 w-24 bg-red-200 hover:bg-red-300"
							on:click={() => clearHistory(time)}>Delete</button>
					</div>
				</div>
			</li>
		{/each}
	</ul>
</Card>

<style lang="postcss">
	.btn {
		@apply bg-indigo-500 hover:bg-indigo-700 rounded px-1 shadow;
	}
</style>
