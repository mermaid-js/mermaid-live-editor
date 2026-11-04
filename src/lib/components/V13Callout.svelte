<script lang="ts">
  import { v13 } from '$/util/v13.svelte';
  import { onMount } from 'svelte';
  import { backOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import MermaidTailIcon from '~icons/custom/mermaid-tail';
  import CloseIcon from '~icons/material-symbols/close-rounded';

  // Appear after the editor settles, not on top of first paint.
  let ready = $state(false);
  onMount(() => {
    const timer = setTimeout(() => (ready = true), 4000);
    return () => clearTimeout(timer);
  });
</script>

{#if ready && !v13.dismissed.value}
  <div
    class="pointer-events-auto relative flex h-10 max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-[#E0095F]/30 bg-background py-1 pr-1 pl-1 text-sm shadow-lg transition-shadow hover:shadow-xl"
    role="note"
    transition:fly={{ duration: 650, easing: backOut, y: 48 }}>
    <span class="relative grid size-8 shrink-0 place-items-center rounded-full bg-[#E0095F]/10">
      <span class="swim size-6"><MermaidTailIcon class="size-full text-[#E0095F]" /></span>
      <span class="bubble left-1" aria-hidden="true"></span>
      <span class="bubble bubble-late right-1" aria-hidden="true"></span>
    </span>
    <span class="min-w-0 truncate">
      Mermaid's on a diet 🥗 <b class="ml-0.5 font-semibold">v13: smaller, faster</b>
    </span>
    <a
      href={v13.url}
      target="_blank"
      rel="noopener"
      class="cta relative shrink-0 pr-1 font-semibold text-[#E0095F] underline underline-offset-2"
      onclick={() => v13.trackClick()}>
      Help shape it <span class="arrow" aria-hidden="true">→</span>
    </a>
    <button
      title="Dismiss"
      aria-label="Dismiss v13 announcement"
      class="relative grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
      onclick={() => (v13.dismissed.value = true)}>
      <CloseIcon class="size-4" />
    </button>
  </div>
{/if}

<style>
  .swim {
    display: block;
    transform-origin: 50% 80%;
    animation: swim 5s 1.6s ease-in-out infinite;
  }
  @keyframes swim {
    0%,
    78%,
    100% {
      transform: translate(0, 0) rotate(0);
    }
    82% {
      transform: translate(-1px, -2px) rotate(-12deg);
    }
    88% {
      transform: translate(1px, -1px) rotate(10deg);
    }
    94% {
      transform: translate(0, 0) rotate(-4deg);
    }
  }

  /* A couple of bubbles rise from the mermaid as the pill arrives. */
  .bubble {
    position: absolute;
    top: 2px;
    width: 5px;
    height: 5px;
    border: 1.5px solid #9370db;
    border-radius: 9999px;
    opacity: 0;
    animation: rise 1.6s 0.5s ease-out 2;
  }
  .bubble-late {
    width: 4px;
    height: 4px;
    animation-delay: 0.9s;
  }
  @keyframes rise {
    0% {
      opacity: 0;
      transform: translateY(0);
    }
    25% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
      transform: translateY(-16px);
    }
  }

  .arrow {
    display: inline-block;
    transition: transform 0.2s ease;
  }
  .cta:hover .arrow,
  .cta:focus-visible .arrow {
    transform: translateX(3px);
  }

  @media (prefers-reduced-motion: reduce) {
    .bubble,
    .swim {
      display: block;
      animation: none;
    }
    .arrow {
      transition: none;
    }
  }
</style>
