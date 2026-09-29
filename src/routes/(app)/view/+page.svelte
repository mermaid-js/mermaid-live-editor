<script lang="ts">
  import View from '$/components/View.svelte';
  import { initHandler } from '$/util/util';
  import { onMount } from 'svelte';
  onMount(initHandler);
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<View shouldShowGrid={false} />
