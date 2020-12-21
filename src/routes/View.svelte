<script>
  import { onMount } from 'svelte';
  import View from '../components/View.svelte';

  onMount(async () => {
    ga('send', 'pageview');
  });
</script>

<style>
  #view-page {
    display: flex;
    height: 100%;
  }
</style>

<div id="view-page">
  <View />
</div>
