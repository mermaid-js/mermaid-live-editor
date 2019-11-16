<script>
import { onMount } from 'svelte';
import Editor from '../components/Editor.svelte';
import View from '../components/View.svelte';

onMount(async () => {
});

	export let code = '';
	export let classes = '';

	export let error = {};
	export let token = '';
	export let expected = '';

</script>

<style>
	#view-page {
		display: flex;
		height: 100%;
	}
</style>

<div id="view-page">
</div>