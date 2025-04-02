<script lang="ts">
  import McWrapper from '$/components/McWrapper.svelte';
  import ThemeIcon from '$/components/ThemeIcon.svelte';
  import * as Popover from '$/components/ui/popover';
  import { Switch } from '$/components/ui/switch';
  import { urlsStore } from '$/util/state';
  import { cn } from '$/utils';
  import { mode, setMode } from 'mode-watcher';
  import type { Component } from 'svelte';
  import AddIcon from '~icons/material-symbols/add-2-rounded';
  import BookIcon from '~icons/material-symbols/book-2-outline-rounded';
  import PluginIcon from '~icons/material-symbols/extension-outline';
  import HomeIcon from '~icons/material-symbols/house-outline-rounded';
  import CommunityIcon from '~icons/material-symbols/person-play-outline-rounded';
  import PlaygroundIcon from '~icons/material-symbols/shape-line-outline';
  import MermaidChartIcon from './MermaidChartIcon.svelte';

  const menuItems = $derived([
    { label: 'New Diagram', icon: AddIcon, href: $urlsStore.new },
    { label: 'Home', icon: HomeIcon, href: 'https://mermaid.js.org/' },
    { label: 'Documentation', icon: BookIcon, href: 'https://mermaid.js.org/intro/' },
    { label: 'Community', icon: CommunityIcon, href: 'https://discord.gg/sKeNQX4Wtj' }
  ]);

  const mermaidChartMenuItems = $derived([
    {
      label: 'Edit in Playground',
      icon: PlaygroundIcon,
      href: $urlsStore.mermaidChart({ medium: 'main_menu' }).playground
    },
    {
      label: 'Plugins',
      icon: PluginIcon,
      href: $urlsStore.mermaidChart({ medium: 'main_menu' }).plugins,
      checkDiagramType: false
    },
    {
      label: 'MermaidChart',
      icon: MermaidChartIcon,
      href: $urlsStore.mermaidChart({ medium: 'main_menu' }).home,
      checkDiagramType: false
    }
  ]);
</script>

{#snippet menuItem(options: { label: string; icon: Component; href: string; class?: string })}
  <a
    href={options.href}
    target="_blank"
    class={cn(
      'flex items-center justify-start gap-2 border-b bg-muted p-2 px-3 hover:bg-background',
      options.class
    )}>
    <options.icon class="size-5" />
    {options.label}
  </a>
{/snippet}

<Popover.Root>
  <Popover.Trigger class="shrink-0">
    <img class="size-6" src="/favicon.svg" alt="Mermaid Live Editor" />
  </Popover.Trigger>
  <Popover.Content align="start" class="flex flex-col overflow-hidden p-0" sideOffset={16}>
    {#each menuItems as item}
      {@render menuItem(item)}
    {/each}

    <div class="flex items-center justify-between border-b bg-muted px-3 py-2 hover:bg-background">
      <span class="flex items-center gap-2">
        <ThemeIcon />
        Dark Mode
      </span>
      <Switch
        checked={$mode === 'dark'}
        onCheckedChange={(dark) => setMode(dark ? 'dark' : 'light')} />
    </div>

    {#each mermaidChartMenuItems as item}
      <McWrapper side="right" shouldCheckDiagramType={item.checkDiagramType}>
        {@render menuItem({
          ...item,
          class: 'text-accent bg-background hover:bg-muted'
        })}
      </McWrapper>
    {/each}
  </Popover.Content>
</Popover.Root>
