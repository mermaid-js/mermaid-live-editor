<script lang="ts">
	import Tabs from '$lib/Tabs/index.svelte';
	import Card from '$lib/Card/index.svelte';
	import { codeStore, getStateString } from '$lib/Util/state';
	import { historyStore } from '$lib/Util/history';

	let historyMode: string = 'saved';

	const tabSelectHandler = (message: CustomEvent<Tab>) => {
		historyMode = message.detail.id;
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

	let previousState = getStateString();

	setInterval(() => {
		const currentState = getStateString();
		if (previousState !== currentState) {
			saveHistory(true);
			previousState = currentState;
		}
	}, 1000);

	let history: HistoryEntry[] = [];
	$: history = $historyStore.filter((h) => (historyMode === 'saved' ? !h.auto : h.auto));
	const saveHistory = (auto = false) => {
		historyStore.update((h) => [
			{
				state: $codeStore,
				time: new Date(),
				name: 'test',
				auto
			},
			...h
		]);
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
			<button class="bg-blue-500 hover:bg-blue-700 rounded px-1" on:click={() => saveHistory()}
				>Save</button
			>
		</div>
	</div>
	<ul>
		{#each history as { state, time, name }}
			<li>
				{time}
				<button on:click={restoreHistory(state)}>Restore</button>
			</li>
		{/each}
	</ul>
</Card>
