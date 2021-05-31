<script lang="ts">
	import '../app.postcss';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	// This can be removed once https://github.com/sveltejs/kit/issues/1612 is fixed.
	// Then move it into src and vite will bundle it automatically.
	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register(`${base}/service-worker.js`, {
					scope: `${base}/`
				})
				.then(function (registration) {
					console.log('Registration successful, scope is:', registration.scope);
				})
				.catch(function (error) {
					console.log('Service worker registration failed, error:', error);
				});
		}
	});
</script>

<main class="h-screen">
	<slot />
</main>
