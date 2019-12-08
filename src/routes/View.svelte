<script>
import { onMount } from 'svelte';
import Editor from '../components/Editor.svelte';
import View from '../components/View.svelte';
import { fromUrl } from '../code-store.js';

onMount(async () => {
	fromUrl(params.data);
	ga('send', 'pageview');
});

	// export let code = '';
	// export let classes = '';

	// export let error = {};
	// export let token = '';
	// export let expected = '';
	export let params = {};
</script>

<style>
	#view-page {
		display: flex;
		height: 100%;
	}
</style>

<div id="view-page">
	<View />
</div>