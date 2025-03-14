<script lang="ts">
  import * as Tooltip from '$lib/components/ui/tooltip';
  import type { Snippet } from 'svelte';
  import ExternalLinkIcon from '~icons/material-symbols/open-in-new-rounded';

  let { children }: { children: Snippet } = $props();
</script>

<Tooltip.Provider>
  <Tooltip.Root delayDuration={100}>
    <Tooltip.Trigger>
      {@render children()}
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p class="flex items-center gap-2">
        <ExternalLinkIcon /> Opens a new tab in Mermaid Chart
      </p>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
