<script lang="ts">
  import { stateStore } from '$/util/state';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import type { ComponentProps, Snippet } from 'svelte';
  import ExternalLinkIcon from '~icons/material-symbols/open-in-new-rounded';

  let {
    children,
    domain,
    shouldCheckDiagramType = true,
    side = 'bottom',
    labelPrefix = 'Opens your diagram in',
    isVisible = true,
    sharesData = true
  }: {
    children: Snippet;
    domain: string;
    shouldCheckDiagramType?: boolean;
    side?: ComponentProps<typeof Tooltip.Content>['side'];
    labelPrefix?: string;
    isVisible?: boolean;
    sharesData?: boolean;
  } = $props();

  let shouldDisableComponent = $derived(
    shouldCheckDiagramType && $stateStore.diagramType === 'zenuml'
  );
</script>

{#if isVisible}
  <Tooltip.Provider>
    <Tooltip.Root delayDuration={100}>
      <Tooltip.Trigger>
        <div class={[shouldDisableComponent && 'pointer-events-none cursor-not-allowed grayscale']}>
          {@render children()}
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content {side} class="bg-secondary shadow-xl">
        <div
          class="flex cursor-help items-center gap-2"
          title={sharesData
            ? 'Your diagram will be sent to the external service'
            : 'Your diagram is not shared'}>
          {#if shouldDisableComponent}
            <div class="text-muted-foreground">
              This diagram type is not supported in {domain}
            </div>
          {:else}
            <ExternalLinkIcon />
            <span class="flex items-center gap-1">
              {labelPrefix}
              <div class="text-accent">{domain}</div>
            </span>
          {/if}
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
{/if}
