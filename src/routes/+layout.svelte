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
    inline-size: 100%;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
  }
</style>
