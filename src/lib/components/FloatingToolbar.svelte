<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div
  class="flex h-12 items-center justify-between gap-2 rounded-2xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur-sm">
  {@render children()}
</div>
