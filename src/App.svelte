<script>
	export let name;
	import Editor from './Editor.svelte'
	import View from './View.svelte'
</script>

<style>
	#app {
		display: flex;
		height: 100%;
	}

</style>

<div id="app">
	<Editor />
	<View />
</div>