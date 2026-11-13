<script lang="ts">
  import { persisted } from '#lib/util/persist.svelte.js';
  import { v13 } from '#lib/util/v13.svelte.js';
  import { onMount } from 'svelte';
  import { backOut } from 'svelte/easing';
  import { fly, scale } from 'svelte/transition';
  import CloseIcon from '~icons/material-symbols/close-rounded';
  import V13Tail from './V13Tail.svelte';

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

    <button
      class="block size-10 cursor-pointer"
      aria-label="Show the Mermaid v13 announcement"
      aria-expanded={open}
      onclick={() => (open = !open)}
      in:fly={{ duration: 700, easing: backOut, y: 48 }}>
      <V13Tail class="size-full" />
    </button>
  </div>
{/if}
