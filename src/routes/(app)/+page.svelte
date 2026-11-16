<script lang="ts">
  import { goto } from '$app/navigation';
  import { buildRedirectUrl } from '#lib/util/redirect.js';
  import { onMount } from 'svelte';

  onMount(async () => {
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- buildRedirectUrl prefixes resolve()
    await goto(buildRedirectUrl(window.location), {
      replace: true
    });
  });
</script>
