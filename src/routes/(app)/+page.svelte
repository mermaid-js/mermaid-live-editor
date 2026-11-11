<script lang="ts">
  import { goto } from '$app/navigation';
  import { buildRedirectUrl } from '#lib/util/redirect.js';
  import { onMount } from 'svelte';

  onMount(async () => {
    await goto(buildRedirectUrl(window.location), {
      replace: true
    });
  });
</script>
