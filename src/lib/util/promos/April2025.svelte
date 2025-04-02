<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { MCBaseURL } from '$/util/util';
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
      url: '/mermaid-ai?utm_source=mermaid_live&utm_medium=banner_ad&utm_campaign=aibundle'
    },
    {
      label: 'Diagram live with teammates in Mermaid Chart',
      url: '/landing?utm_source=mermaid_live&utm_medium=banner_ad&utm_campaign=team_collaboration'
    },
    {
      label: 'Use the Visual Editor in Mermaid Chart to design and build diagrams',
      url: '/landing?utm_source=mermaid_live&utm_medium=banner_ad&utm_campaign=visual_editor'
    },
    {
      label: 'Explore the Mermaid Whiteboard from the creators of Mermaid',
      url: '/whiteboard?utm_source=mermaid_live&utm_medium=banner_ad&utm_campaign=whiteboard'
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
  class="flex w-full bg-[#E0095F] p-1.5"
  role="banner"
  onmouseenter={() => (shouldAnimate = false)}
  onmouseleave={() => (shouldAnimate = true)}>
  <div class="grid grow">
    {#key currentTagline}
      <a
        href={MCBaseURL + currentTagline.url}
        target="_blank"
        class="col-start-1 row-start-1 flex items-center justify-center gap-4 no-underline"
        in:fade={{ delay: 800 }}
        out:fade={{ duration: 1000 }}>
        <span class="text-sm tracking-wider text-white">{currentTagline.label}</span>
        <Button
          class="shrink-0 rounded-md bg-[#1E1A2E] px-3 py-1.5 text-sm font-semibold tracking-wide text-white hover:bg-[#261A56]">
          Try now
        </Button>
      </a>
    {/key}
  </div>
  {@render closeBanner()}
</div>
