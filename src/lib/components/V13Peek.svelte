<script lang="ts">
  import { persisted } from '$/util/persist.svelte';
  import { v13 } from '$/util/v13.svelte';
  import { onMount } from 'svelte';
  import { backOut } from 'svelte/easing';
  import { fly, scale } from 'svelte/transition';
  import MermaidTailIcon from '~icons/custom/mermaid-tail';
  import CloseIcon from '~icons/material-symbols/close-rounded';

  // The bubble pops once on the first visit; after that only on hover, focus or tap.
  const seen = persisted('v13PeekSeen', false);

  let ready = $state(false);
  let open = $state(false);

  onMount(() => {
    const timers = [
      // Appear after the editor settles, not on top of first paint.
      setTimeout(() => (ready = true), 4000),
      setTimeout(() => {
        if (!seen.value) {
          open = true;
          seen.value = true;
        }
      }, 5200),
      setTimeout(() => (open = false), 13_000)
    ];
    return () => timers.forEach(clearTimeout);
  });
</script>

{#if ready && !v13.dismissed.value}
  <div
    class="pointer-events-auto relative flex flex-col items-end"
    role="group"
    aria-label="Mermaid v13 announcement"
    onmouseenter={() => (open = true)}
    onmouseleave={() => (open = false)}
    onfocusin={() => (open = true)}
    onfocusout={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
        open = false;
      }
    }}>
    {#if open}
      <div
        class="relative mb-3 w-max max-w-80 rounded-2xl border bg-background px-4 py-2.5 text-center text-sm shadow-lg"
        transition:scale={{ duration: 300, easing: backOut, start: 0.6 }}
        style="transform-origin: calc(100% - 20px) 100%">
        <button
          title="Dismiss"
          aria-label="Dismiss v13 announcement"
          class="absolute -top-2 -right-2 rounded-full border bg-background p-0.5 text-muted-foreground hover:bg-muted"
          onclick={() => (v13.dismissed.value = true)}>
          <CloseIcon class="size-3.5" />
        </button>
        Cutting carbs (and kilobytes) 🥗<br />
        v13: smaller, faster, sleeker<br />
        <a
          href={v13.url}
          target="_blank"
          rel="noopener"
          class="font-bold text-[#E0095F] underline underline-offset-2"
          onclick={() => v13.trackClick()}>Swim over and weigh in →</a>
        <span
          class="absolute right-3.5 -bottom-[7px] size-3 rotate-45 border-r border-b bg-background"
        ></span>
      </div>
    {/if}

    <span class="bubble right-3" aria-hidden="true"></span>
    <span class="bubble bubble-late right-6" aria-hidden="true"></span>

    <button
      class="tail block size-10 cursor-pointer"
      aria-label="Show the Mermaid v13 announcement"
      aria-expanded={open}
      onclick={() => (open = !open)}
      in:fly={{ duration: 700, easing: backOut, y: 48 }}>
      <MermaidTailIcon class="size-full text-[#E0095F]" />
    </button>
  </div>
{/if}

<style>
  .tail {
    transform-origin: 50% 100%;
    animation: flap 3.2s 1s ease-in-out infinite;
  }
  @keyframes flap {
    0%,
    70%,
    100% {
      rotate: 0deg;
    }
    76% {
      rotate: -12deg;
    }
    84% {
      rotate: 10deg;
    }
    92% {
      rotate: -5deg;
    }
  }
  .bubble {
    position: absolute;
    bottom: 2rem;
    width: 7px;
    height: 7px;
    border: 1.5px solid #9370db;
    border-radius: 9999px;
    opacity: 0;
    animation: float 3.2s 1.4s ease-in infinite;
  }
  .bubble-late {
    width: 5px;
    height: 5px;
    animation-delay: 2.3s;
  }
  @keyframes float {
    0% {
      opacity: 0;
      transform: translateY(0);
    }
    20% {
      opacity: 0.8;
    }
    100% {
      opacity: 0;
      transform: translateY(-3rem);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .tail,
    .bubble {
      animation: none;
    }
  }
</style>
