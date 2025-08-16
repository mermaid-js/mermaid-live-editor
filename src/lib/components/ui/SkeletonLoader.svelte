<script lang="ts">
  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<div class="flex flex-1 overflow-hidden {className}">
  <div class="flex h-full w-full animate-pulse">
    <!-- Left panel skeleton -->
    <div class="hidden md:block w-[30%] min-w-[15%] p-6 pt-0">
      <div class="flex h-full flex-col gap-6">
        <!-- Editor card skeleton -->
        <div class="rounded-lg border bg-card">
          <div class="flex items-center justify-between border-b p-4">
            <div class="flex space-x-2">
              <div class="h-6 w-16 bg-muted rounded"></div>
              <div class="h-6 w-16 bg-muted rounded"></div>
            </div>
            <div class="h-6 w-6 bg-muted rounded"></div>
          </div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-muted rounded w-3/4"></div>
            <div class="h-4 bg-muted rounded w-1/2"></div>
            <div class="h-4 bg-muted rounded w-5/6"></div>
            <div class="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>

        <!-- Diagram viewer skeleton -->
        <div class="rounded-lg border bg-card p-4">
          <div class="h-6 w-32 bg-muted rounded mb-4"></div>
          <div class="space-y-3">
            <div class="h-8 bg-muted rounded"></div>
            <div class="h-8 bg-muted rounded"></div>
            <div class="h-8 bg-muted rounded"></div>
          </div>
        </div>

        <!-- Description area skeleton -->
        <div class="rounded-2xl bg-gray-700 px-4 py-2">
          <div class="h-6 bg-gray-600 rounded mb-2"></div>
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <div class="h-6 w-6 bg-gray-600 rounded"></div>
              <div class="h-6 w-6 bg-gray-600 rounded"></div>
            </div>
            <div class="h-6 w-16 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resizer skeleton -->
    <div class="w-1 bg-border"></div>

    <!-- Right panel skeleton -->
    <div class="flex-1 p-6 pt-0">
      <div class="h-full rounded-lg border bg-card">
        <div class="flex items-center justify-between border-b p-4">
          <div class="flex items-center space-x-4">
            <div class="h-6 w-24 bg-muted rounded"></div>
            <div class="flex space-x-2">
              <div class="h-6 w-6 bg-muted rounded"></div>
              <div class="h-6 w-6 bg-muted rounded"></div>
              <div class="h-6 w-6 bg-muted rounded"></div>
            </div>
          </div>
          <div class="flex space-x-2">
            <div class="h-6 w-16 bg-muted rounded"></div>
            <div class="h-6 w-16 bg-muted rounded"></div>
          </div>
        </div>
        <div class="p-4 h-full">
          <div class="h-full bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</div>
