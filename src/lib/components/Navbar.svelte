<script lang="ts" module>
  import { logEvent, plausible } from '$lib/util/stats';
  import { version } from 'mermaid/package.json';
  import { fly } from 'svelte/transition';
  import { writable } from 'svelte/store';
  void logEvent('version', {
    mermaidVersion: version
  });
  // Si vous utilisez des stores pour l'utilisateur
  export let user = writable(null);

  let isMenuOpen = false;
  let isDropdownOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }

  function logout() {
    // Implémentez la logique de déconnexion ici
    console.log('Logout');
  }
</script>

<script lang="ts">
  import MainMenu from '$/components/MainMenu.svelte';
  import McWrapper from '$/components/McWrapper.svelte';
  import { Button } from '$/components/ui/button';
  import { Separator } from '$/components/ui/separator';
  import { Switch } from '$/components/ui/switch';
  import { dismissPromotion, getActivePromotion } from '$lib/util/promos/promo';
  import { urlsStore } from '$lib/util/state';
  import { MCBaseURL } from '$lib/util/util';
  import type { ComponentProps, Snippet } from 'svelte';
  import CloseIcon from '~icons/material-symbols/close-rounded';
  import GithubIcon from '~icons/mdi/github';
  import DropdownNavMenu from './DropdownNavMenu.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  const isReferral = document.referrer.includes(MCBaseURL);

  type Links = ComponentProps<typeof DropdownNavMenu>['links'];

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
        class="hover:bg-transparent hover:text-[#261A56]"
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
      <a href="/" class="whitespace-nowrap text-subtitle text-primary">
        {#if !isReferral}
          <b>IDEM</b> Mermaid
        {/if}
      </a>

      <McWrapper labelPrefix="Opens the current diagram in">
        <div class="hidden items-center justify-center gap-4 md:flex">
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
                  $urlsStore.mermaidChart({ medium: 'toggle' }).playground,
                  '_self',
                  // Do not send referrer header, if the user already came from playground
                  isReferral ? 'noreferrer' : ''
                );
              }, 100);
            }} />

          <a
            href={$urlsStore.mermaidChart({ medium: 'toggle' }).playground}
            class="whitespace-nowrap">
            Playground <span class="hidden text-sm opacity-50 lg:inline"
              >- more features, no account required</span>
          </a>
        </div>
      </McWrapper>
    </div>
  </div>
  <div id="menu" class="w-[500px ] hidden flex-nowrap items-center justify-between gap-3 md:flex">
    <Separator orientation="vertical" />
    {@render children()}
  </div>
</nav>
