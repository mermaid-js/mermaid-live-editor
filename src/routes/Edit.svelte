<script>
import { onMount } from 'svelte';
import Editor from '../components/Editor.svelte';
import View from '../components/View.svelte';
import { fromUrl } from '../code-store.js';

onMount(async () => {
	console.log('Data = ', params.data)
	fromUrl(params.data);
});

	export let code = '';
	export let classes = '';

	export let error = {};
	export let token = '';
	export let expected = '';
	export let params = {};

</script>

<style>
	#editor-container {
		display: flex;
		height: 100%;
	}
</style>

<div id="editor-container">
	<Editor data={params.data}/>
	<View />
</div>