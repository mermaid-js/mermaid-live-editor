<script lang="ts">
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Taglines {
    label: string;
    url: string;
  }

  const taglines: Taglines[] = [
    {
      label: 'Explore the Mermaid Whiteboard from the creators of Mermaid',
      url: 'https://www.mermaidchart.com/whiteboard?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=whiteboard'
    },
    {
      label: 'Use the Visual Editor in Mermaid Chart to design and build diagrams',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=visual_editor'
    },
    {
      label: 'Diagram live with teammates in Mermaid Chart',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=teams'
    },
    {
      label: 'Replace ChatGPT Pro, Mermaid.live, and LucidChart with Mermaid Pro',
      url: 'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=AIbundle'
    }
  ];

  let index = Math.floor(Math.random() * taglines.length);
  let currentTagline = $state(taglines[index]);

  const interval = setInterval(() => {
    index = (index + 1) % taglines.length;
    currentTagline = taglines[index];
  }, 40_000);

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="grid w-full">
  {#key currentTagline}
    <a
      href={currentTagline.url}
      target="_blank"
      class="col-start-1 row-start-1 flex items-center justify-center gap-4 no-underline"
      in:fade={{ delay: 750 }}
      out:fade={{ duration: 1000 }}>
      <span class="text-sm tracking-wider">{currentTagline.label}</span>
      <button class="rounded bg-[#111113] p-1 px-2 text-sm font-semibold tracking-wide"
        >Try now</button>
    </a>
  {/key}
</div>
