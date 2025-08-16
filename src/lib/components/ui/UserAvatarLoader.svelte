<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let { size = 'md', class: className = '' }: Props = $props();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
</script>

<div class="relative {sizeClasses[size]} {className}">
  <!-- Avatar skeleton -->
  <div class="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 animate-pulse"></div>
  
  <!-- Animated loading ring -->
  <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
  
  <!-- User icon placeholder -->
  <div class="absolute inset-0 flex items-center justify-center">
    <svg class="w-1/2 h-1/2 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
    </svg>
  </div>
</div>
