<script lang="ts">
  import { env } from '$/util/env';
  import { stateStore } from '$/util/state';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import type { ComponentProps, Snippet } from 'svelte';
  import ExternalLinkIcon from '~icons/material-symbols/open-in-new-rounded';

  let {
    children,
    shouldCheckDiagramType = true,
    side = 'bottom',
    labelPrefix = 'Opens a new tab in'
  }: {
    children: Snippet;
    shouldCheckDiagramType?: boolean;
    side?: ComponentProps<typeof Tooltip.Content>['side'];
    labelPrefix?: string;
  } = $props();

  let shouldDisableComponent = $derived(
    shouldCheckDiagramType && $stateStore.diagramType === 'zenuml'
  );
</script>

{#if env.isEnabledMermaidChartLinks}
  <Tooltip.Provider>
    <Tooltip.Root delayDuration={100}>
      <Tooltip.Trigger>
        <div class={[shouldDisableComponent && 'pointer-events-none cursor-not-allowed grayscale']}>
          {@render children()}
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content {side}>
        <div class="flex items-center gap-2">
          {#if shouldDisableComponent}
            <div class="text-muted-foreground">
              This diagram type is not supported in MermaidChart.com
            </div>
          {:else}
            <ExternalLinkIcon />
            <span class="flex items-center gap-1">
              {labelPrefix}
              <div class="text-accent">MermaidChart.com</div>
            </span>
          {/if}
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
{/if}
