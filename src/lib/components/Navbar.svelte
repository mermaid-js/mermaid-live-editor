<script context="module" lang="ts">
  import { version } from 'mermaid/package.json';
  import { logEvent, plausible } from '$lib/util/stats';
  void logEvent('version', {
    mermaidVersion: version
  });
</script>

<script lang="ts">
  import Theme from './Theme.svelte';
  import { dismissPromotion, getActivePromotion } from '$lib/util/promos/promo';
  import Privacy from './Privacy.svelte';
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  interface Link {
    href: string;
    title?: string;
    icon?: string;
    img?: string;
  }
  const links: Link[] = [
    {
      title: 'Documentation',
      href: 'https://mermaid.js.org/intro/getting-started.html'
    },
    {
      title: 'Tutorial',
      href: 'https://mermaid.js.org/config/Tutorials.html'
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
      href: 'https://github.com/mermaid-js/mermaid-live-editor',
      icon: 'fab fa-github fa-lg'
    },
    {
      href: 'https://mermaidchart.com',
      img: './mermaidchart-logo.svg'
    }
  ];

  let activePromotion = getActivePromotion();

  const trackBannerClick = () => {
    if (!plausible || !activePromotion) {
      return;
    }
    logEvent('bannerClick', {
      promotion: activePromotion.id
    });
  };
</script>

{#if activePromotion}
  <div
    class="top-bar z-10 flex h-fit w-full items-center justify-center bg-gradient-to-r from-[#bd34fe] to-[#ff3670] p-1 text-center text-white">
    <div
      class="flex flex-grow"
      role="button"
      tabindex="0"
      on:click={trackBannerClick}
      on:keypress={trackBannerClick}>
      <svelte:component this={activePromotion.component} />
    </div>
    <button
      title="Dismiss banner"
      on:click={() => {
        dismissPromotion(activePromotion?.id);
        activePromotion = undefined;
      }}>
      <i class="fa fa-close px-2" />
    </button>
  </div>
{/if}

<div class="navbar bg-primary p-0 shadow-lg">
  <div class="mx-2 flex-1 px-2">
    <span class="text-lg font-bold">
      <a href="/">Mermaid<span class="text-xs font-thin">v{version}</span> Live Editor</a>
    </span>
  </div>

  <label
    for="menu-toggle"
    class={isMenuOpen ? 'hidden' : 'pointer-cursor fixed right-4 z-[1000] lg:hidden'}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      class="fill-current"
      width="20"
      height="20"
      viewBox="0 0 20 20">
      <title>Menu</title>
      <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
    </svg>
  </label>

  <!-- Cross SVG -->
  <label
    for="menu-toggle"
    class={isMenuOpen ? 'pointer-cursor fixed right-4 z-[1000] lg:hidden' : 'hidden'}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      class="fill-current"
      width="20"
      height="20"
      viewBox="0 0 20 20">
      <title>Cross</title>
      <line x1="5" y1="5" x2="15" y2="15" stroke="white" stroke-width="2" />
      <line x1="5" y1="15" x2="15" y2="5" stroke="white" stroke-width="2" />
    </svg>
  </label>

  <input
    class="hidden"
    type="checkbox"
    id="menu-toggle"
    bind:checked={isMenuOpen}
    on:click={toggleMenu} />

  <div class="hidden w-full lg:flex lg:w-auto lg:items-center" id="menu">
    <Theme />
    <ul class="items-center justify-between pt-4 text-base lg:flex lg:pt-0">
      <li>
        <Privacy />
      </li>
      {#each links as { title, href, icon, img }}
        <li>
          <a class="btn btn-ghost" target="_blank" {href}>
            {#if icon}
              <i class={icon} />
            {:else if img}
              <img src={img} alt={title} />
            {/if}
            {#if title}
              {title}
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  #menu-toggle:checked + #menu {
    position: absolute;
    top: 2.5rem;
    padding: 1rem 0;
    background: #661ae6;
    display: flex;
  }

  .navbar {
    z-index: 10000;
  }

  img {
    width: 1.5rem;
    height: 1.5rem;
  }
</style>
