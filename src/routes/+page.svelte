<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  onMount(async () => {
    // Handle old live editor links and redirect to new version
    const hash = window.location.hash.split('/');
    let newURL = 'edit';
    if (hash.length > 2) {
      newURL = `${hash[1]}#${hash[2]}`;
    }
    await goto(`${base}/${newURL}`, {
      replaceState: true
    });
  });
</script>
