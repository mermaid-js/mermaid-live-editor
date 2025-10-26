<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../app.css';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<main class="app-shell">
  {@render children()}
</main>

<style>
  .app-shell {
    min-height: 100dvh;
    min-width: 100vw;
  }
</style>
