<script lang="ts">
	import '../app.postcss';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	// This can be removed once https://github.com/sveltejs/kit/issues/1612 is fixed.
	// Then move it into src and vite will bundle it automatically.
	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register(`${base}/service-worker.js`);
		}
	});
</script>

<main class="h-screen">
	<slot />
</main>
