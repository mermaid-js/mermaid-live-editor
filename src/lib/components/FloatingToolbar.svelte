<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="flex items-center justify-between gap-2 rounded-2xl bg-muted p-2">
  {@render children()}
</div>
