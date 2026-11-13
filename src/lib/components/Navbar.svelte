<script lang="ts" module>
  import { logEvent, logMermaidChartClick } from '#lib/util/stats.js';
  import { version } from 'mermaid/package.json';

  void logEvent('version', {
    mermaidVersion: version
  });
</script>

<script lang="ts">
  import { resolve } from '$app/paths';
  import MainMenu from '#lib/components/MainMenu.svelte';
  import { Button } from '#lib/components/ui/button/index.js';
  import { Separator } from '#lib/components/ui/separator/index.js';
  import { dismissPromotion, getActivePromotion } from '#lib/util/promos/promo.svelte.js';
  import { untrack, type ComponentProps, type Snippet } from 'svelte';
  import MermaidIcon from '~icons/custom/mermaid';
  import CloseIcon from '~icons/material-symbols/close-rounded';
  import GithubIcon from '~icons/mdi/github';
  import DropdownNavMenu from './DropdownNavMenu.svelte';

  interface Props {
    mobileToggle?: Snippet;
    children: Snippet;
    hidePromotion?: boolean;
  }

  let { children, mobileToggle, hidePromotion = false }: Props = $props();

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

  let activePromotion = $state(untrack(() => (hidePromotion ? undefined : getActivePromotion())));

  const trackBannerClick = () => {
    if (!activePromotion) {
      return;
    }
    logEvent('bannerClick', {
      promotion: activePromotion.id
    });
    logMermaidChartClick('banner');
  };

  const closeActivePromotion = () => {
    if (!activePromotion) {
      return;
    }
    logEvent('bannerClose', {
      promotion: activePromotion.id
    });
    dismissPromotion(activePromotion.id);
    activePromotion = undefined;
  };

  // The editor is often left open for days, so swap out a promotion whose time
  // is up (e.g. pre-launch for launch) without waiting for a reload.
  const promotionCheckIntervalMs = 30_000;
  $effect(() => {
    if (hidePromotion) {
      return;
    }
    const interval = setInterval(() => {
      if (activePromotion && activePromotion.endDate.getTime() <= Date.now()) {
        activePromotion = getActivePromotion();
      }
    }, promotionCheckIntervalMs);
    return () => clearInterval(interval);
  });
</script>

{#if activePromotion}
  <div class="top-bar z-10 flex h-fit w-full bg-primary">
    <div
      class="flex grow"
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
        class="hover:bg-transparent hover:text-[#261A56]"
        size="sm"
        onclick={closeActivePromotion}>
        <CloseIcon />
      </Button>
    {/snippet}
  </div>
{/if}

<nav class="z-50 flex p-4 sm:p-6">
  <div class="flex flex-1 items-center gap-2">
    <MainMenu />
    <MermaidIcon class="size-6" />
    <a href={resolve('/(app)')} class="whitespace-nowrap text-accent">
      {#if !mobileToggle}
        Mermaid
      {/if}
      Live Editor
    </a>
  </div>
  <div
    id="menu"
    class="hidden flex-nowrap items-center justify-between gap-3 overflow-hidden md:flex">
    <DropdownNavMenu icon={GithubIcon} links={githubLinks} />
    <Separator orientation="vertical" />
    {@render children()}
  </div>
  {@render mobileToggle?.()}
</nav>
