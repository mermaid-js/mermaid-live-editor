<script context="module">
	import { version } from 'mermaid/package.json';
	import { analytics } from '$lib/util/stats';
	analytics?.track('version', {
		mermaidVersion: version
	});
</script>

<script lang="ts">
	interface Link {
		title: string;
		href: string;
		icon?: string;
	}
	const links: Link[] = [
		{
			title: 'Documentation',
			href: 'https://mermaid-js.github.io/mermaid/#/n00b-gettingStarted'
		},
		{
			title: 'Tutorial',
			href: 'https://github.com/mermaid-js/mermaid/blob/develop/docs/Tutorials.md'
		},
		{
			title: 'Mermaid',
			href: 'https://github.com/mermaid-js/mermaid'
		},
		{
			title: 'CLI',
			href: 'https://github.com/mermaid-js/mermaid-cli'
		},
		{
			title: '',
			href: 'https://github.com/mermaid-js/mermaid-live-editor',
			icon: 'fab fa-github fa-lg'
		}
	];
</script>

<header class="p-2 bg-indigo-400 text-white font-bold flex flex-wrap items-center">
	<div class="flex-1 flex justify-between items-center">
		<a href="/">Mermaid<span class="text-xs font-thin">v{version}</span> Live Editor</a>
	</div>

	<label for="menu-toggle" class="pointer-cursor lg:hidden block"
		><svg
			class="fill-current "
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg
		></label>
	<input class="hidden" type="checkbox" id="menu-toggle" />

	<div class="hidden lg:flex lg:items-center lg:w-auto w-full" id="menu">
		<nav>
			<ul class="lg:flex items-center justify-between text-base pt-4 lg:pt-0">
				{#each links as { title, href, icon }}
					<li>
						<a class="nav-btn" target="_blank" {href}>
							{#if icon}
								<i class={icon} />
							{/if}
							{title}</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<style>
	#menu-toggle:checked + #menu {
		display: block;
	}
	header {
		z-index: 10000;
	}
</style>
