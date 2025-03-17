<script lang="ts">
  import { env } from '$/util/env';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import type { Snippet } from 'svelte';
  import ExternalLinkIcon from '~icons/material-symbols/open-in-new-rounded';

  let { children }: { children: Snippet } = $props();
</script>

{#if env.isEnabledMermaidChartLinks}
  <Tooltip.Provider>
    <Tooltip.Root delayDuration={100}>
      <Tooltip.Trigger>
        {@render children()}
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom">
        <div class="flex items-center gap-2">
          <ExternalLinkIcon />
          <span class="flex items-center gap-1">
            Opens a new tab in <div class="text-accent">MermaidChart.com</div>
          </span>
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
{/if}
