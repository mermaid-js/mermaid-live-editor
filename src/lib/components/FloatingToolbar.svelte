<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div
  class="flex h-12 items-center justify-between gap-2 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-frost)] p-3 shadow-[var(--shadow-floating)] backdrop-blur-xl">
  {@render children()}
</div>
