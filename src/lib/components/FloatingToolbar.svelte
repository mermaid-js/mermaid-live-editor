<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="flex h-12 items-center justify-between gap-2 rounded-2xl bg-muted p-3">
  {@render children()}
</div>
