<script context="module" lang="ts">
  import { version } from 'mermaid/package.json';
  import { analytics } from '$lib/util/stats';
  void analytics?.track('version', {
    mermaidVersion: version
  });
</script>

<script lang="ts">
  import Theme from './Theme.svelte';

  interface Link {
    title: string;
    href: string;
    icon?: string;
  }
  const links: Link[] = [
    {
      title: 'Documentation',
      href: 'https://mermaid-js.github.io/mermaid/intro/n00b-gettingStarted.html'
    },
    {
      title: 'Tutorial',
      href: 'https://mermaid-js.github.io/mermaid/config/Tutorials.html'
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

<div class="navbar shadow-lg bg-primary p-0">
  <div class="flex-1 px-2 mx-2">
    <span class="text-lg font-bold">
      <a href="/">Mermaid<span class="text-xs font-thin">v{version}</span> Live Editor</a>
    </span>
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

  <Theme />
  <div class="hidden lg:flex lg:items-center lg:w-auto w-full" id="menu">
    <ul class="lg:flex items-center justify-between text-base pt-4 lg:pt-0">
      {#each links as { title, href, icon }}
        <li>
          <a class="btn btn-ghost" target="_blank" rel="noreferrer" {href}>
            {#if icon}
              <i class={icon} />
            {/if}
            {title}</a>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  #menu-toggle:checked + #menu {
    display: block;
  }
  .navbar {
    z-index: 10000;
  }
</style>
