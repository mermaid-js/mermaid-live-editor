<script lang="ts">
	import Tabs from '$lib/components/tabs.svelte';
	import Card from '$lib/components/card.svelte';
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

	const HISTORY_SAVE_INTERVAL: number = 1000;

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
</script>

<Card class="h-52">
	<div slot="title" class="flex justify-between">
		<div class="flex">
			<Tabs on:select={tabSelectHandler} {tabs} title="History" />
		</div>
		<div class="flex gap-x-4 text-white">
			<button class="bg-yellow-500 hover:bg-yellow-700 rounded px-1" on:click={() => saveHistory()}
				>💾</button
			>
			<button class="bg-yellow-500 hover:bg-yellow-700 rounded px-1" on:click={() => clearHistory()}
				>❌</button
			>
		</div>
	</div>
	<ul class="p-2 space-y-2 overflow-auto">
		{#each $historyStore as { state, time, name }}
			<li class="rounded p-2 shadow flex-col">
				<div class="flex">
					<div class="flex-1">
						<div class="flex flex-col">
							<span>{name}</span>
						</div>
					</div>
					<div class="flex gap-2 content-center">
						<button class="rounded px-2 bg-green-200" on:click={() => restoreHistory(state)}
							>Restore</button
						>
						<button class="rounded px-2 bg-red-200" on:click={() => clearHistory(time)}
							>Delete</button
						>
					</div>
				</div>
				<span class="text-gray-400 text-sm">{relativeTime(time)}</span>
			</li>
		{/each}
	</ul>
</Card>
