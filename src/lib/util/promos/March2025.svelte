<script lang="ts">
  import { onDestroy, type Snippet } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Props {
    closeBanner: Snippet;
  }

  let { closeBanner }: Props = $props();

  interface Taglines {
    label: string;
    url: string;
  }

  const taglines: Taglines[] = [
    {
      label: 'Replace ChatGPT Pro, Mermaid.live, and Lucid Chart with Mermaid Chart',
      url: 'https://www.mermaidchart.com/mermaid-ai?utm_source=mermaid_live&utm_medium=banner_ad&utm_campaign=aibundle'
    },
    {
      label: 'Diagram live with teammates in Mermaid Chart',
      url: 'www.mermaidchart.com/landing?utm_source=mermaid_live&utm_medium=banner_ad&utm_campaign=team_collaboration'
    },
    {
      label: 'Use the Visual Editor in Mermaid Chart to design and build diagrams',
      url: 'www.mermaidchart.com/landing?utm_source=mermaid_live&utm_medium=banner_ad&utm_campaign=visual_editor'
    },
    {
      label: 'Explore the Mermaid Whiteboard from the creators of Mermaid',
      url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live&utm_medium=banner_ad&utm_campaign=whiteboard'
    }
  ];

  let index = Math.floor(Math.random() * taglines.length);
  let currentTagline = $state(taglines[index]);

  const interval = setInterval(() => {
    if (shouldAnimate) {
      index = (index + 1) % taglines.length;
      currentTagline = taglines[index];
    }
  }, 5000);

  onDestroy(() => {
    clearInterval(interval);
  });

  let shouldAnimate = $state(true);
</script>

<div
  class="flex w-full bg-gradient-to-r from-[#bd34fe] to-[#ff3670] p-1.5"
  role="banner"
  onmouseenter={() => (shouldAnimate = false)}
  onmouseleave={() => (shouldAnimate = true)}>
  <div class="grid grow">
    {#key currentTagline}
      <a
        href={currentTagline.url}
        target="_blank"
        class="col-start-1 row-start-1 flex items-center justify-center gap-4 no-underline"
        in:fade={{ delay: 750 }}
        out:fade={{ duration: 1000 }}>
        <span class="text-sm tracking-wider">{currentTagline.label}</span>
        <button
          class="shrink-0 rounded-lg bg-[#1E1A2E] px-3 py-1.5 text-sm font-semibold tracking-wide">
          Try now
        </button>
      </a>
    {/key}
  </div>
  {@render closeBanner()}
</div>
