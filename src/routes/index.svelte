<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	// Handle old live editor links and redirect to new version
	onMount(async () => {
		const hash = window.location.hash.split('/');
		let newURL = '/edit';
		if (hash.length > 2) {
			newURL = `/${hash[1]}#${hash[2]}`;
		}
		debugger;
		await goto(newURL, {
			replaceState: true
		});
	});
</script>

<svelte:head>
	<title>Mermaid Live Editor</title>
</svelte:head>
