<script lang="ts">
  import { v13 } from '$/util/v13.svelte';
  import { version } from 'mermaid/package.json';
  import { onMount } from 'svelte';
  import CloseIcon from '~icons/material-symbols/close-rounded';
  import V13Tail from './V13Tail.svelte';

  // Show the version first; expand into the message after the editor settles.
  let ready = $state(false);
  onMount(() => {
    const timer = setTimeout(() => (ready = true), 4000);
    return () => clearTimeout(timer);
  });
</script>

{#if !ready}
  <span class="text-sm font-semibold opacity-60">v{version}</span>
{:else}
  <!-- Stands in for the version number in the bottom-right toolbar until dismissed. -->
  <span
    class="expand flex h-7 items-center gap-1 rounded-full bg-[#E0095F]/10 pr-0.5 pl-2.5 text-sm font-semibold whitespace-nowrap">
    <V13Tail class="size-4" />
    v13 is on a diet ·
    <a
      href={v13.url}
      target="_blank"
      rel="noopener"
      class="font-bold text-[#E0095F] underline underline-offset-2"
      onclick={() => v13.trackClick()}>Weigh in →</a>
    <button
      title="Dismiss"
      aria-label="Dismiss v13 announcement"
      class="rounded-full p-1 opacity-60 hover:bg-muted hover:opacity-100"
      onclick={() => (v13.dismissed.value = true)}>
      <CloseIcon class="size-3.5" />
    </button>
  </span>
{/if}

<style>
  /* Grow leftward out of the version number; bubbles may still rise above. */
  .expand {
    overflow-x: clip;
    /* backwards: no width cap once it has grown, so the text never clips. */
    animation: expand 0.8s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
  @keyframes expand {
    from {
      max-width: 4.5rem;
    }
    to {
      max-width: 17rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .expand {
      animation: none;
    }
  }
</style>
