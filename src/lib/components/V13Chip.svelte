<script lang="ts">
  import { v13 } from '$/util/v13.svelte';
  import { version } from 'mermaid/package.json';
  import { onMount } from 'svelte';
  import MermaidTailIcon from '~icons/custom/mermaid-tail';
  import CloseIcon from '~icons/material-symbols/close-rounded';

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
    <span class="relative inline-block size-4 shrink-0" aria-hidden="true">
      <span class="wag block size-full"><MermaidTailIcon class="size-full text-[#E0095F]" /></span>
      <span class="bubble left-0"></span>
      <span class="bubble bubble-late right-0"></span>
    </span>
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

  /* Every 5s the tail wags and lets out a couple of bubbles. */
  .wag {
    transform-origin: 50% 80%;
    animation: wag 5s 1s ease-in-out infinite;
  }
  @keyframes wag {
    0%,
    78%,
    100% {
      rotate: 0deg;
    }
    82% {
      rotate: -14deg;
    }
    88% {
      rotate: 10deg;
    }
    94% {
      rotate: -4deg;
    }
  }
  .bubble {
    position: absolute;
    top: 0;
    width: 6px;
    height: 6px;
    border: 1.5px solid #9370db;
    border-radius: 9999px;
    opacity: 0;
    animation: rise 5s 1s ease-out infinite;
  }
  .bubble-late {
    width: 4px;
    height: 4px;
    animation-delay: 1.3s;
  }
  @keyframes rise {
    0%,
    82% {
      opacity: 0;
      transform: translateY(0);
    }
    86% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-18px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .expand,
    .wag,
    .bubble {
      animation: none;
    }
  }
</style>
