<script lang="ts">
  import MermaidTailIcon from '~icons/custom/mermaid-tail';

  // Size it with a class (e.g. `size-6`); the bubbles scale with it.
  let { class: className = '' }: { class?: string } = $props();
</script>

<!-- The logo's tail: wags every 5s and lets out a couple of bubbles. -->
<span class={['tail relative inline-block shrink-0', className]} aria-hidden="true">
  <span class="wag block size-full"><MermaidTailIcon class="size-full text-[#E0095F]" /></span>
  <span class="bubble left-0"></span>
  <span class="bubble bubble-late right-0"></span>
</span>

<style>
  .tail {
    container-type: size;
  }
  .wag {
    transform-origin: 50% 85%;
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
    width: clamp(6px, 30cqw, 8px);
    height: clamp(6px, 30cqw, 8px);
    border: 1.5px solid #9370db;
    border-radius: 9999px;
    opacity: 0;
    animation: rise 5s 1s ease-out infinite;
  }
  .bubble-late {
    width: clamp(4px, 20cqw, 6px);
    height: clamp(4px, 20cqw, 6px);
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
      transform: translateY(-100cqh);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .wag,
    .bubble {
      animation: none;
    }
  }
</style>
