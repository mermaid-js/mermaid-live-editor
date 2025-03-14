<script module lang="ts">
  import { logEvent, plausible } from '$lib/util/stats';
  import { version } from 'mermaid/package.json';
  void logEvent('version', {
    mermaidVersion: version
  });
</script>

<script lang="ts">
  import { Separator } from '$/components/ui/separator';
  import { Switch } from '$/components/ui/switch';
  import { env } from '$/util/env';
  import { dismissPromotion, getActivePromotion } from '$lib/util/promos/promo';
  import { urlsStore } from '$lib/util/state';
  import { MCBaseURL } from '$lib/util/util';
  import type { ComponentProps, Snippet } from 'svelte';
  import GithubIcon from '~icons/fa-brands/github';
  import CloseIcon from '~icons/material-symbols/close-rounded';
  import DropdownNavMenu from './DropdownNavMenu.svelte';
  import MainMenu from './MainMenu.svelte';
  import { Button } from './ui/button';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  const isReferral = document.referrer.includes(MCBaseURL);

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
  <div class="top-bar z-10 flex h-fit w-full bg-primary">
    <div
      class="flex flex-grow"
      role="button"
      tabindex="0"
      onclick={trackBannerClick}
      onkeypress={trackBannerClick}>
      <activePromotion.component {closeBanner} />
    </div>
    {#snippet closeBanner()}
      <Button
        title="Dismiss banner"
        variant="ghost"
        size="sm"
        onclick={() => {
          dismissPromotion(activePromotion?.id);
          activePromotion = undefined;
        }}>
        <CloseIcon />
      </Button>
    {/snippet}
  </div>
{/if}

<nav class="z-50 flex p-6">
  <div class="flex flex-1 items-center gap-4">
    <MainMenu />

    <div
      id="switcher"
      class="flex items-center justify-center gap-4 font-medium"
      class:flex-row-reverse={isReferral}>
      <a href="/" class="whitespace-nowrap text-accent">
        {#if !isReferral}
          Mermaid
        {/if}
        Live Editor
      </a>
      {#if env.isEnabledMermaidChartLinks}
        <div class=" hidden items-center justify-center gap-4 md:flex">
          <Separator orientation="vertical" />
          <Switch
            id="editorMode"
            class="data-[state=checked]:bg-secondary"
            checked={isReferral}
            onclick={() => {
              logEvent('playgroundToggle', { isReferred: isReferral });
              // Wait for the event to be logged
              setTimeout(() => {
                window.open(
                  $urlsStore.mermaidChart.playground,
                  '_self',
                  // Do not send referrer header, if the user already came from playground
                  isReferral ? 'noreferrer' : ''
                );
              }, 100);
            }} />

          <a href={$urlsStore.mermaidChart.playground} class="whitespace-nowrap">
            Playground <span class="hidden text-sm opacity-50 lg:inline"
              >- more features, no account required</span>
          </a>
        </div>
      {/if}
    </div>
  </div>

  <div
    id="menu"
    class="hidden h-full w-full flex-nowrap items-center justify-between gap-3 overflow-hidden pt-4 text-base md:flex md:w-auto md:items-center md:pt-0">
    <DropdownNavMenu icon={GithubIcon} links={githubLinks} />
    <Separator orientation="vertical" />
    {@render children()}
  </div>
</nav>
