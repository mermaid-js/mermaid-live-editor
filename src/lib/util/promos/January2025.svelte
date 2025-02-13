<script lang="ts">
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Taglines {
    name: string;
    design: string;
    label: string;
    url: string;
  }

  const allTaglines: Taglines[] = [
    {
      name: 'A AI Bundle',
      design: '1',
      label: '1 Replace ChatGPT Pro, Mermaid.live, and Lucid Chart with Mermaid Chart',
      url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=AIbundle_A'
    },
    {
      name: 'B AI Bundle',
      design: '2',
      label: 'Replace ChatGPT Pro, Mermaid.live, and Lucid Chart with Mermaid Chart',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=AIbundle_B'
    },
    {
      name: 'C AI Bundle',
      design: '1',
      label: '1 Replace ChatGPT Pro, Mermaid.live, and Lucid Chart with Mermaid Pro',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=AIbundle_C'
    },
    {
      name: 'D AI Bundle',
      design: '2',
      label: 'Replace ChatGPT Pro, Mermaid.live, and Lucid Chart with Mermaid Pro',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=AIbundle_D'
    },
    {
      name: 'A Teams',
      design: '1',
      label: '1 Diagram live with teammates in Mermaid Chart',
      url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=teams_A'
    },
    {
      name: 'B Teams',
      design: '2',
      label: 'Diagram live with teammates in Mermaid Chart',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=teams_B'
    },
    {
      name: 'C Teams',
      design: '1',
      label: '1 Diagram live with teammates in Mermaid Pro',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=teams_C'
    },
    {
      name: 'D Teams',
      design: '2',
      label: 'Diagram live with teammates in Mermaid Pro',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=teams_D'
    },
    {
      name: 'A Visual Editor',
      design: '1',
      label: '1 Use the Visual Editor in Mermaid Chart to design and build diagrams',
      url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=visual_editor_A'
    },
    {
      name: 'B Visual Editor',
      design: '2',
      label: 'Use the Visual Editor in Mermaid Chart to design and build diagrams',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=visual_editor_B'
    },
    {
      name: 'C Visual Editor',
      design: '1',
      label: '1 Use the Visual Editor in Mermaid Pro to design and build diagrams',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=visual_editor_C'
    },
    {
      name: 'D Visual Editor',
      design: '2',
      label: 'Use the Visual Editor in Mermaid Pro to design and build diagrams',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=visual_editor_D'
    },
    {
      name: 'A Whiteboard',
      design: '1',
      label: '1 Explore the Mermaid Whiteboard from the creators of Mermaid',
      url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=whiteboard_A'
    },
    {
      name: 'B Whiteboard',
      design: '2',
      label: 'Explore the Mermaid Whiteboard from the creators of Mermaid',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=whiteboard_A'
    },
    {
      name: 'C Whiteboard',
      design: '1',
      label: '1 Explore the Mermaid Whiteboard from the creators of Mermaid',
      url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=whiteboard_B'
    },
    {
      name: 'D Whiteboard',
      design: '2',
      label: 'Explore the Mermaid Whiteboard from the creators of Mermaid',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_js&utm_medium=banner_ad&utm_campaign=whiteboard_B'
    }
  ];

  const sets = ['A', 'B', 'C', 'D'];
  let selectedSet = sets[Math.floor(Math.random() * sets.length)];

  const taglines = allTaglines.filter((tagline) => tagline.name.startsWith(selectedSet));

  let index = Math.floor(Math.random() * taglines.length);
  let currentTagline = $state(taglines[index]);

  const interval = setInterval(() => {
    index = (index + 1) % taglines.length;
    currentTagline = taglines[index];
  }, 2000);

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

{#key currentTagline}
  <div class="w-full">
    <div
      class={currentTagline.design === '1'
        ? 'bg-gradient-to-r from-[#bd34fe] to-[#ff3670] '
        : 'bg-[#2E2183]'}>
      <a
        href={currentTagline.url}
        target="_blank"
        class="col-start-1 row-start-1 flex items-center justify-center gap-4 no-underline"
        in:fade={{ delay: 750 }}
        out:fade={{ duration: 1000 }}>
        <span class="text-sm tracking-wider">{currentTagline.label}</span>
        <button
          class="rounded p-1 px-2 text-sm font-semibold tracking-wide {currentTagline.design === '1'
            ? 'bg-[#2E2183]'
            : currentTagline.design === '2'
              ? 'bg-[#E0095F]'
              : ''}">Try now</button>
      </a>
    </div>
  </div>
{/key}
