<script lang="ts">
  import FloatingToolbar from '$/components/FloatingToolbar.svelte';
  import { Button } from '$/components/ui/button';
  import * as Popover from '$/components/ui/popover';
  import { Separator } from '$/components/ui/separator';
  import { Toggle } from '$/components/ui/toggle';
  import { defaultState, inputStateStore } from '$/util/state';
  import { diagramThemes, diagramThemeId } from '$lib/themes/theme-store';
  import ThemeIcon from './ThemeIcon.svelte';
  import RoughIcon from '~icons/material-symbols/draw-outline-rounded';
  import BackgroundIcon from '~icons/material-symbols/grid-4x4-rounded';

  if ($inputStateStore.grid === undefined) {
    // Handle cases where old states were saved without grid option
    $inputStateStore.grid = defaultState.grid;
  }
</script>

<FloatingToolbar>
  <Toggle bind:pressed={$inputStateStore.rough} size="sm" title="Hand-Drawn">
    <RoughIcon />
  </Toggle>
  <Toggle bind:pressed={$inputStateStore.grid} size="sm" title="Background Grid">
    <BackgroundIcon />
  </Toggle>

  <Separator orientation="vertical" />

  <Popover.Root>
    <Popover.Trigger class="cursor-pointer">
      <Button variant="ghost" size="icon" title="Theme" class="[&_svg]:size-5">
        <ThemeIcon />
      </Button>
    </Popover.Trigger>
    <Popover.Content
      side="top"
      align="start"
      sideOffset={8}
      class="flex flex-col gap-1 border border-glass-border bg-popover/95 p-2 backdrop-blur-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {#each diagramThemes as theme (theme.id)}
        <button
          type="button"
          onclick={() => ($diagramThemeId = theme.id)}
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted
            {$diagramThemeId === theme.id
            ? 'bg-muted font-semibold text-primary'
            : 'text-foreground'}">
          <span
            class="size-3 rounded-full border border-border"
            style="background: {theme.dark.cssVariables['--background']}"></span>
          {theme.name}
          {#if $diagramThemeId === theme.id}
            <span class="ml-auto text-xs text-primary">&#10003;</span>
          {/if}
        </button>
      {/each}
    </Popover.Content>
  </Popover.Root>
</FloatingToolbar>
