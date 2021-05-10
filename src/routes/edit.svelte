<script context="module">
	export const ssr = false;
</script>

<script lang="ts">
	import Editor from '$lib/Editor/index.svelte';
	import Card from '$lib/Card/index.svelte';
	import Tabs from '$lib/Tabs/index.svelte';
	import { initURLSubscription, updateCode } from '$lib/Util/state';
	import { loadStateFromURL } from '$lib/Util/util';

	let selectedTab = 'code';
	const tabSelectHandler = (message: CustomEvent<Tab>) => {
		selectedTab = message.detail.id;
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

	const updateHandler = async (message: CustomEvent<EditorUpdateEvent>) => {
		updateCode(message.detail.text, false);
	};

	loadStateFromURL();
	initURLSubscription();
</script>

<svelte:head>
	<title>Edit</title>
</svelte:head>

<div class="w-2/5 h-screen flex flex-col gap-6">
	<Card class="h-1/2">
		<div slot="title">
			<Tabs on:select={tabSelectHandler} {tabs} />
		</div>

		{#if selectedTab == 'code'}
			<Editor on:update={updateHandler} />
		{:else}
			<Editor on:update={updateHandler} />
		{/if}
	</Card>

	<Card class="h-1/3" />
</div>
