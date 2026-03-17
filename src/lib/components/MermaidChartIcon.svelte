<script lang="ts">
  import type { ClassValue } from 'svelte/elements';

  let { class: className }: { class?: ClassValue } = $props();
</script>

<img class={['size-4', className]} src="/icons/sotatek_logo.jpg" alt="SotaTek" />
