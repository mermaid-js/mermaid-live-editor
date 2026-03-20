<script lang="ts">
  import McWrapper from '$/components/McWrapper.svelte';
  import * as Popover from '$/components/ui/popover';
  import { env } from '$/util/env';
  import { urlsStore } from '$/util/state';
  import { logMermaidChartClick } from '$/util/stats';
  import { cn } from '$/utils';
  import { activeTheme, cycleTheme } from '$lib/themes/theme-store';
  import type { Component, Snippet } from 'svelte';
  import MermaidTailIcon from '~icons/custom/mermaid-tail';
  import AddIcon from '~icons/material-symbols/add-2-rounded';
  import BookIcon from '~icons/material-symbols/book-2-outline-rounded';
  import DuplicateIcon from '~icons/material-symbols/content-copy-outline-rounded';
  import ContrastIcon from '~icons/material-symbols/contrast';
  import PluginIcon from '~icons/material-symbols/electrical-services-rounded';
  import MenuIcon from '~icons/material-symbols/menu-rounded';
  import CommunityIcon from '~icons/material-symbols/person-play-outline-rounded';
  import PlaygroundIcon from '~icons/material-symbols/shape-line-outline';
  import MermaidChartIcon from './MermaidChartIcon.svelte';

  interface MenuItem {
    label: string;
    icon: Component;
    href: string;
    class?: string;
    onclick?: () => void;
    sharesData?: boolean;
    checkDiagramType?: boolean;
    isSectionEnd?: boolean;
    renderer: (item: Omit<MenuItem, 'renderer'>) => ReturnType<Snippet>;
  }

  const menuItems: MenuItem[] = $derived([
    { label: 'New', icon: AddIcon, href: $urlsStore.new, renderer: menuItem },
    { label: 'Duplicate', icon: DuplicateIcon, href: window.location.href, renderer: menuItem },
    {
      href: $urlsStore.mermaidChart({ medium: 'main_menu' }).playground,
      icon: PlaygroundIcon,
      isSectionEnd: true,
      label: 'Edit in Playground',
      onclick: () => logMermaidChartClick('editInPlayground'),
      renderer: mcMenuItem
    },
    {
      label: 'Mermaid.js',
      icon: MermaidTailIcon,
      href: env.docsUrl,
      renderer: menuItem
    },
    {
      label: 'Documentation',
      icon: BookIcon,
      href: `${env.docsUrl}/intro/`,
      renderer: menuItem
    },
    {
      label: 'Community',
      icon: CommunityIcon,
      href: 'https://discord.gg/sKeNQX4Wtj',
      renderer: menuItem
    },
    {
      checkDiagramType: false,
      href: $urlsStore.mermaidChart({ medium: 'main_menu' }).plugins,
      icon: PluginIcon,
      label: 'Plugins',
      onclick: () => logMermaidChartClick('plugins'),
      renderer: mcMenuItem,
      sharesData: false
    },
    {
      href: '#',
      icon: ContrastIcon,
      isSectionEnd: true,
      label: 'Theme',
      renderer: themeMenuItem
    },
    {
      checkDiagramType: false,
      class: 'text-accent border-b-0',
      href: $urlsStore.mermaidChart({ medium: 'main_menu' }).home,
      icon: MermaidChartIcon,
      label: 'Mermaid',
      onclick: () => logMermaidChartClick('mermaidHome'),
      renderer: mcMenuItem,
      sharesData: false
    }
  ]);
</script>

{#snippet menuItem(options: MenuItem)}
  <a
    href={options.href}
    target="_blank"
    onclick={options.onclick}
    class={cn(
      'flex items-center justify-start gap-2 border-b border-[var(--border-strong)] p-2 px-3 transition-colors hover:bg-[var(--surface-soft)]',
      options.isSectionEnd && 'border-border-dark',
      options.class
    )}>
    <options.icon class="size-5" />
    {options.label}
  </a>
{/snippet}

{#snippet mcMenuItem(item: MenuItem)}
  <McWrapper
    side="right"
    labelPrefix={item.sharesData === false ? 'Opens a new tab in' : undefined}
    sharesData={item.sharesData}
    shouldCheckDiagramType={item.checkDiagramType}>
    {@render menuItem(item)}
  </McWrapper>
{/snippet}

{#snippet themeMenuItem(options: MenuItem)}
  <button
    type="button"
    onclick={() => cycleTheme()}
    class={cn(
      'flex w-full cursor-pointer items-center justify-between border-b border-[var(--border-strong)] px-3 py-2 transition-colors hover:bg-[var(--surface-soft)]',
      options.isSectionEnd && 'border-border-dark',
      options.class
    )}>
    <span class="flex items-center gap-2">
      <ContrastIcon />
      Theme
    </span>
    <span class="text-xs text-muted-foreground">{$activeTheme.name}</span>
  </button>
{/snippet}

<Popover.Root>
  <Popover.Trigger class="shrink-0 cursor-pointer">
    <MenuIcon class="size-6" />
  </Popover.Trigger>
  <Popover.Content
    align="start"
    class="flex flex-col overflow-hidden border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-0 text-foreground shadow-[var(--shadow-floating)] backdrop-blur-xl"
    sideOffset={16}>
    {#each menuItems as { renderer, ...item } (item.label)}
      {@render renderer(item)}
    {/each}
  </Popover.Content>
</Popover.Root>
