<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let message: string = '';
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16', 
    lg: 'h-24 w-24'
  };
  
  const containerSizeClasses = {
    sm: 'h-32',
    md: 'h-64',
    lg: 'h-96'
  };
</script>

<div class="flex justify-center items-center {containerSizeClasses[size]} flex-col gap-4">
  <div class="relative">
    <div
      class="animate-spin rounded-full {sizeClasses[size]} border-2 border-blue-500/30 border-t-blue-500"
    ></div>
    <div
      class="absolute inset-0 rounded-full animate-pulse bg-blue-500/10 backdrop-blur-sm"
    ></div>
  </div>
  {#if message}
    <p class="text-sm text-gray-600 dark:text-gray-400 text-center">{message}</p>
  {/if}
</div>
