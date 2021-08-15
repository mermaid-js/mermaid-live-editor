<script>
	import { toggleDarkTheme } from '$lib/util/state';

	import { setTheme, themeStore } from '$lib/util/theme';
	import { onMount } from 'svelte';

	const themes = [
		'light',
		'dark',
		'cupcake',
		'bumblebee',
		'emerald',
		'corporate',
		'synthwave',
		'retro',
		'cyberpunk',
		'valentine',
		'halloween',
		'garden',
		'forest',
		'aqua',
		'lofi',
		'pastel',
		'fantasy',
		'wireframe',
		'black',
		'luxury',
		'dracula'
	];

	let selectedTheme = $themeStore.theme;
	onMount(() => {
		themeStore.subscribe(({ theme, isDark }) => {
			document.getElementsByTagName('html')[0].setAttribute('data-theme', theme);
			toggleDarkTheme(isDark);
		});
	});
</script>

<select
	class="select select-bordered"
	bind:value={selectedTheme}
	on:change={() => setTheme(selectedTheme)}>
	{#each themes as theme}
		<option value={theme}>{theme}</option>
	{/each}
</select>
