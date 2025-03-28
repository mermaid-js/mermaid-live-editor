<script lang="ts">
  import { Button } from '$/components/ui/button';
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

  const allTaglines: { [key: string]: { design: number; taglines: Taglines[] } } = {
    A: {
      design: 1,
      taglines: [
        {
          label: 'Replace ChatGPT Pro, Mermaid.live, and Lucid Chart with Mermaid Chart',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=AIbundle_A'
        },
        {
          label: 'Diagram live with teammates in Mermaid Chart',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=teams_A'
        },
        {
          label: 'Use the Visual Editor in Mermaid Chart to design and build diagrams',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=visual_editor_A'
        },
        {
          label: 'Explore the Mermaid Whiteboard from the creators of Mermaid',
          url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=whiteboard_A'
        }
      ]
    },
    B: {
      design: 2,
      taglines: [
        {
          label: 'Replace ChatGPT Pro, Mermaid.live, and Lucid Chart with Mermaid Chart',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=AIbundle_B'
        },
        {
          label: 'Diagram live with teammates in Mermaid Chart',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=teams_B'
        },
        {
          label: 'Use the Visual Editor in Mermaid Chart to design and build diagrams',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=visual_editor_B'
        },
        {
          label: 'Explore the Mermaid Whiteboard from the creators of Mermaid',
          url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=whiteboard_B'
        }
      ]
    },
    C: {
      design: 1,
      taglines: [
        {
          label: 'Replace ChatGPT Pro, Mermaid.live, and Lucid Chart with Mermaid Pro',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=AIbundle_C'
        },
        {
          label: 'Diagram live with teammates in Mermaid Pro',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=teams_C'
        },
        {
          label: 'Use the Visual Editor in Mermaid Pro to design and build diagrams',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=visual_editor_C'
        },
        {
          label: 'Explore the Mermaid Whiteboard from the creators of Mermaid',
          url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=whiteboard_A'
        }
      ]
    },
    D: {
      design: 2,
      taglines: [
        {
          label: 'Replace ChatGPT Pro, Mermaid.live, and Lucid Chart with Mermaid Pro',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=AIbundle_D'
        },
        {
          label: 'Diagram live with teammates in Mermaid Pro',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=teams_D'
        },
        {
          label: 'Use the Visual Editor in Mermaid Pro to design and build diagrams',
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=visual_editor_D'
        },
        {
          label: 'Explore the Mermaid Whiteboard from the creators of Mermaid',
          url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=whiteboard_B'
        }
      ]
    }
  };

  const { design, taglines } =
    Object.values(allTaglines)[Math.floor(Math.random() * Object.values(allTaglines).length)];

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
  class="flex w-full p-1.5 {design === 1
    ? 'bg-gradient-to-r from-[#bd34fe] to-[#ff3670]'
    : 'bg-[#E0095F]'}"
  role="banner"
  onmouseenter={() => (shouldAnimate = false)}
  onmouseleave={() => (shouldAnimate = true)}>
  <div class="grid grow">
    {#key currentTagline}
      <a
        href={currentTagline.url}
        target="_blank"
        class="col-start-1 row-start-1 flex items-center justify-center gap-4 no-underline"
        in:fade={{ delay: 800 }}
        out:fade={{ duration: 1000 }}>
        <span class="text-sm tracking-wider text-white">{currentTagline.label}</span>
        <Button size="sm" class="bg-background font-semibold tracking-wider">Try now</Button>
      </a>
    {/key}
  </div>
  {@render closeBanner()}
</div>
