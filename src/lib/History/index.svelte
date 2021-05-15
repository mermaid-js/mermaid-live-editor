<script lang="ts">
	import Tabs from '$lib/Tabs/index.svelte';
	import Card from '$lib/Card/index.svelte';
	import { codeStore, getStateString } from '$lib/Util/state';
	import { addHistoryEntry, autoHistoryMode, historyStore } from './history';
	import { notify } from '$lib/Util/notify';

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

	const previousState = {};

	setInterval(() => {
		saveHistory(true);
	}, HISTORY_SAVE_INTERVAL);

	const saveHistory = (auto = false) => {
		const currentState = getStateString();
		if (previousState[`${auto}`] !== currentState) {
			addHistoryEntry({
				state: $codeStore,
				time: new Date(),
				name: 'test',
				auto
			});
			previousState[`${auto}`] = currentState;
		} else if (!auto) {
			notify('State already saved.');
		}
	};

	const restoreHistory = (state: State): any => {
		codeStore.set({ ...state, updateEditor: true, updateDiagram: true });
	};
</script>

<Card class="h-1/2">
	<div slot="title" class="flex">
		<div class="flex"><Tabs on:select={tabSelectHandler} {tabs} /></div>
		<div class="flex-grow" />
		<div class="flex gap-x-4 text-white">
			<button class="bg-yellow-500 hover:bg-yellow-700 rounded px-1" on:click={() => saveHistory()}
				>💾</button
			>
		</div>
	</div>
	<ul>
		{#each $historyStore as { state, time, name }}
			<li>
				{time}
				{name}
				<button on:click={restoreHistory(state)}>Restore</button>
			</li>
		{/each}
	</ul>
</Card>
