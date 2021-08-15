<script>
	import { themeStore } from '$lib/util/state';

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
</script>

<select class="select select-bordered w-full max-w-xs" bind:value={$themeStore}>
	{#each themes as theme}
		<option value={theme}>{theme}</option>
	{/each}
</select>
