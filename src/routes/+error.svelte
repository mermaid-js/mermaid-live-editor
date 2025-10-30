<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  // Only redirect if it's a 404 error
  onMount(() => {
    if ($page.status === 404) {
      goto('/');
    }
  });
</script>

{#if $page.status !== 404}
  <div class="container mx-auto p-8">
    <h1 class="mb-4 text-2xl font-bold">Error {$page.status}</h1>
    <p class="mb-4">{$page.error?.message || 'An unexpected error occurred'}</p>
    <a href="/" class="text-blue-500 hover:underline">Return to Home</a>
  </div>
{/if}
