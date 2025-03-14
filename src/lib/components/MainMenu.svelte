<script lang="ts">
  import McTooltip from '$/components/MCTooltip.svelte';
  import * as Popover from '$/components/ui/popover';
  import { Switch } from '$/components/ui/switch';
  import { env } from '$/util/env';
  import { urlsStore } from '$/util/state';
  import { cn } from '$/utils';
  import { mode, setMode } from 'mode-watcher';
  import type { Component } from 'svelte';
  import { scale } from 'svelte/transition';
  import AddIcon from '~icons/material-symbols/add-2-rounded';
  import BookIcon from '~icons/material-symbols/book-2-outline-rounded';
  import HelpIcon from '~icons/material-symbols/help-outline-rounded';
  import HomeIcon from '~icons/material-symbols/house-outline-rounded';
  import MoonIcon from '~icons/material-symbols/nights-stay-outline';
  import PlaygroundIcon from '~icons/material-symbols/shape-line-outline';
  import SunIcon from '~icons/material-symbols/sunny-rounded';

  const menuItems = [
    { label: 'New Diagram', icon: AddIcon, href: '/' },
    { label: 'Home', icon: HomeIcon, href: 'https://mermaid.js.org/' },
    { label: 'Docs', icon: BookIcon, href: 'https://mermaid.js.org/intro/' },
    { label: 'Help', icon: HelpIcon, href: 'https://discord.gg/sKeNQX4Wtj' }
  ];
</script>

{#snippet menuItem(options: { label: string; icon: Component; href: string; class?: string })}
  <a
    href={options.href}
    target="_blank"
    class={cn(
      'flex items-center justify-start gap-2 border-b bg-muted p-2 px-3 hover:bg-background',
      options.class
    )}>
    <options.icon />
    {options.label}
  </a>
{/snippet}

<Popover.Root>
  <Popover.Trigger class="flex shrink-0 items-center gap-0">
    <img class="size-6" src="./favicon.svg" alt="Mermaid Live Editor" />
  </Popover.Trigger>
  <Popover.Content align="start" class="overflow-hidden  p-0" sideOffset={16}>
    <div class="flex flex-col">
      {#each menuItems as item}
        {@render menuItem(item)}
      {/each}
      <div
        class="flex items-center justify-between border-b bg-muted px-3 py-2 hover:bg-background">
        <span class="flex items-center gap-2">
          <div class="grid">
            {#key $mode}
              <div transition:scale class="col-start-1 row-start-1">
                {#if $mode === 'dark'}
                  <MoonIcon />
                {:else}
                  <SunIcon />
                {/if}
              </div>
            {/key}
          </div>
          Dark Mode
        </span>
        <Switch
          checked={$mode === 'dark'}
          onCheckedChange={(dark) => setMode(dark ? 'dark' : 'light')} />
      </div>
      {#if env.isEnabledMermaidChartLinks}
        <McTooltip>
          {@render menuItem({
            label: 'Edit in Playground',
            icon: PlaygroundIcon,
            href: $urlsStore.mermaidChart.playground,
            class: 'text-accent bg-background hover:bg-background/50'
          })}
        </McTooltip>
      {/if}
    </div>
  </Popover.Content>
</Popover.Root>
