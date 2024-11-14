<script module lang="ts">
  import { logEvent, plausible } from '$lib/util/stats';
  import { version } from 'mermaid/package.json';
  void logEvent('version', {
    mermaidVersion: version
  });
</script>

<script lang="ts">
  import { env } from '$lib/util/env';
  import { dismissPromotion, getActivePromotion } from '$lib/util/promos/promo';
  import { stateStore } from '$lib/util/state';
  import { MCBaseURL } from '$lib/util/util';
  import type { ComponentProps } from 'svelte';
  import DropdownNavMenu from './DropdownNavMenu.svelte';
  import Privacy from './Privacy.svelte';
  import Theme from './Theme.svelte';

  const { isEnabledMermaidChartLinks } = env;

  let isMenuOpen = $state(false);
  const isReferral = document.referrer.includes(MCBaseURL);
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  type Links = ComponentProps<typeof DropdownNavMenu>['links'];

  const githubLinks: Links = [
    { title: 'Mermaid JS', href: 'https://github.com/mermaid-js/mermaid' },
    {
      title: 'Mermaid Live Editor',
      href: 'https://github.com/mermaid-js/mermaid-live-editor'
    },
    {
      title: 'Mermaid CLI',
      href: 'https://github.com/mermaid-js/mermaid-cli'
    }
  ];

  const documentationLinks: Links = [
    { title: 'Getting started', href: 'https://mermaid.js.org/intro/getting-started.html' },
    { title: 'Tutorials', href: 'https://mermaid.js.org/ecosystem/tutorials.html' },
    {
      title: 'Integrations',
      href: 'https://mermaid.js.org/ecosystem/integrations-community.html'
    }
  ];

  let activePromotion = $state(getActivePromotion());

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
      onclick={trackBannerClick}
      onkeypress={trackBannerClick}>
      <activePromotion.component />
    </div>
    <button
      class="rounded hover:text-black"
      title="Dismiss banner"
      aria-label="Dismiss banner"
      onclick={() => {
        dismissPromotion(activePromotion?.id);
        activePromotion = undefined;
      }}>
      <i class="fa fa-close px-2"></i>
    </button>
  </div>
{/if}

<div class="navbar z-50 bg-primary p-0 shadow-lg">
  <div class="mx-2 flex flex-1 gap-2 px-2">
    <a href="/"><img class="size-6" src="./favicon.svg" alt="Mermaid Live Editor" /></a>
    <div
      id="switcher"
      class="flex items-center justify-center gap-2 font-bold"
      class:flex-row-reverse={isReferral}>
      <a href="/">
        {#if !isReferral}
          Mermaid
        {/if}
        Live Editor
      </a>
      {#if isEnabledMermaidChartLinks}
        <input
          type="checkbox"
          class="toggle toggle-primary"
          id="editorMode"
          checked={isReferral}
          onclick={() => {
            logEvent('playgroundToggle', { isReferred: isReferral });
            window.open(
              `${MCBaseURL}/play#${$stateStore.serialized}`,
              '_self',
              // Do not send referrer header, if the user already came from playground
              isReferral ? 'noreferrer' : ''
            );
          }} />
        <a href="{MCBaseURL}/play#{$stateStore.serialized}">Playground</a>
      {/if}
    </div>
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
    onclick={toggleMenu} />

  <div class="hidden w-full lg:flex lg:w-auto lg:items-center" id="menu">
    <span class="text-sm">v{version}</span>
    <ul class="items-center justify-between pt-4 text-base lg:flex lg:pt-0">
      <li>
        <Privacy />
      </li>
      <li>
        <Theme />
      </li>
      <li>
        <DropdownNavMenu label="Documentation" links={documentationLinks} />
      </li>
      <li>
        <DropdownNavMenu icon="fab fa-github fa-lg" links={githubLinks} />
      </li>

      {#if isEnabledMermaidChartLinks}
        <li>
          <a class="btn btn-ghost" target="_blank" href="https://mermaidchart.com">
            <img class="size-6" src="./mermaidchart-logo.svg" alt="Mermaid Chart" />
          </a>
        </li>
      {/if}
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
</style>
