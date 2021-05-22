<script>
  import { onMount } from 'svelte';
  import View from '../components/View.svelte';
  import { fromUrl } from '../code-store.js';
  export let params = {};

  onMount(async () => {
    ga('send', 'pageview');
    if (params.data) {
      fromUrl(params.data);
    }
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
