<script lang="ts">
	import { onMount } from 'svelte';
	import Editor from '$lib/Editor/index.svelte';
	import { encode, decode } from 'js-base64';
	import Card from '$lib/Card/index.svelte';
	const updateHandler = async (message: CustomEvent<EditorUpdateEvent>) => {
		window.location.hash = encode(message.detail.text, true);
	};
</script>

<svelte:head>
	<title>Edit</title>
</svelte:head>

<div class="w-2/5 h-screen flex flex-col gap-6">
	<div class="h-2/3  overflow-hidden">
		<Card>
			<h1 slot="title">Hello</h1>
			<Editor slot="body" on:update={updateHandler} />
		</Card>
	</div>
	<div class="flex-grow shadow bg-white p-4 rounded">
		<Editor on:update={updateHandler} />
	</div>
</div>
