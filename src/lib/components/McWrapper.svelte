<script lang="ts">
  import { env } from '$/util/env';
  import type { ComponentProps } from 'svelte';
  import ExternalLinkWrapper from './ExternalLinkWrapper.svelte';

  let {
    children,
    ...props
  }: Omit<ComponentProps<typeof ExternalLinkWrapper>, 'isVisible' | 'domain'> = $props();
</script>

<ExternalLinkWrapper
  {...props}
  domain="MermaidChart.com"
  isVisible={env.isEnabledMermaidChartLinks}>
  {@render children()}
</ExternalLinkWrapper>
