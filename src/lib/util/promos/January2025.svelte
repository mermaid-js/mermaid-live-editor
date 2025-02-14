<script lang="ts">
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';

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
          url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=AIbundle_A'
        },
        {
          label: 'Diagram live with teammates in Mermaid Chart',
          url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=teams_A'
        },
        {
          label: 'Use the Visual Editor in Mermaid Chart to design and build diagrams',
          url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=visual_editor_A'
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
          url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=whiteboard_A'
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
          url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=whiteboard_B'
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
          url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=whiteboard_B'
        }
      ]
    }
  };

  const { design, taglines } =
    Object.values(allTaglines)[Math.floor(Math.random() * Object.values(allTaglines).length)];

  let index = Math.floor(Math.random() * taglines.length);
  let currentTagline = $state(taglines[index]);

  const interval = setInterval(() => {
    index = (index + 1) % taglines.length;
    currentTagline = taglines[index];
  }, 5000);

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div
  class="grid w-full {design === 1
    ? 'bg-gradient-to-r from-[#bd34fe] to-[#ff3670]'
    : 'bg-[#2E2183]'} ">
  {#key currentTagline}
    <a
      href={currentTagline.url}
      target="_blank"
      class="col-start-1 row-start-1 flex items-center justify-center gap-4 p-0.5 no-underline"
      in:fade={{ delay: 750 }}
      out:fade={{ duration: 1000 }}>
      <span class="text-sm tracking-wider">{currentTagline.label}</span>
      <button
        class="rounded p-0.5 px-2 text-sm font-semibold tracking-wide"
        class:bg-[#2E2183]={design === 1}
        class:bg-[#E0095F]={design === 2}>Try now</button>
    </a>
  {/key}
</div>
