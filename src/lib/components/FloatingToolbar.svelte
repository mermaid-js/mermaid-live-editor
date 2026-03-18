<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div
  class="flex h-12 items-center justify-between gap-2 rounded-2xl border border-glass-border bg-glass-bg p-3 shadow-lg backdrop-blur-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
  {@render children()}
</div>
