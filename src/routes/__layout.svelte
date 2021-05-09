<script lang="ts">
	import Header from '$lib/Header/index.svelte';
	import '../app.postcss';
</script>

<div class="h-screen">
	<!-- <Header /> -->

	<main class="h-full bg-red-300">
		<slot />
	</main>
</div>

<style>
</style>
