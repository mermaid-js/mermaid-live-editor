<script lang="ts">
  export let title: string = 'Error';
  export let message: string = '';
  export let showRetry: boolean = false;
  export let onRetry: (() => void) | undefined = undefined;
</script>

<div class="flex justify-center items-center h-64 flex-col gap-4">
  <div class="text-center max-w-md">
    <div class="mb-4">
      <svg class="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
    {#if message}
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>
    {/if}
    {#if showRetry && onRetry}
      <button 
        on:click={onRetry}
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Retry
      </button>
    {/if}
  </div>
</div>
