<script lang="ts">
  import { env } from '$/util/env';
  import { isOnMermaidAI } from '$/util/migration/domainMigration';
  import type { ComponentProps } from 'svelte';
  import ExternalLinkWrapper from './ExternalLinkWrapper.svelte';

  let {
    children,
    ...props
  }: Omit<
    ComponentProps<typeof ExternalLinkWrapper>,
    'isVisible' | 'domain' | 'showPopup'
  > = $props();

  const mermaidChartDomain = 'mermaid.ai';
</script>

<ExternalLinkWrapper
  {...props}
  domain={mermaidChartDomain}
  isVisible={env.isEnabledMermaidChartLinks}
  showPopup={!isOnMermaidAI()}>
  {@render children()}
</ExternalLinkWrapper>
