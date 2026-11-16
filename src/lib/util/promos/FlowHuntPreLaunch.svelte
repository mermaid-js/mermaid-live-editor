<script lang="ts">
  import type { Snippet } from 'svelte';
  import FlowHunt from './FlowHunt.svelte';

  interface Props {
    closeBanner: Snippet;
  }

  let { closeBanner }: Props = $props();
</script>

<FlowHunt phase="pre-launch" {closeBanner} />
