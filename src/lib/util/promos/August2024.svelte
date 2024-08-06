<script lang="ts">
  import { onDestroy } from 'svelte';

  interface Taglines {
    label: string;
    url: string;
  }

  const taglines: Taglines[] = [
    {
      label: 'Use the Visual Editor in Mermaid Chart to design and build diagrams',
      url: 'https://www.mermaidchart.com/landing?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=visual_editor'
    },
    {
      label: 'Diagram live with teammates in Mermaid Chart',
      url: 'https://www.mermaidchart.com/landing?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=teams'
    },
    {
      label: 'Skip the rough draft with Mermaid AI in Mermaid Chart',
      url: 'https://www.mermaidchart.com/mermaid-ai?utm_source=mermaid_live_editor&utm_medium=banner_ad&utm_campaign=mermaid_ai'
    }
  ];

  let index = Math.floor(Math.random() * taglines.length);
  let currentTagline = taglines[index];
  let isFadingOut = false;

  const interval = setInterval(() => {
    isFadingOut = true;

    setTimeout(() => {
      isFadingOut = false;
      index = (index + 1) % taglines.length;
      currentTagline = taglines[index];
    }, 1000);
  }, 60_000);

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

{#key currentTagline}
  <a
    href={currentTagline.url}
    target="_blank"
    class="flex-grow animate-fadeIn no-underline {isFadingOut ? 'animate-fadeOut' : ''}">
    <span class="text-surface-50 dark:text-surface-50 text-sm tracking-wider transition-opacity"
      >{currentTagline.label}</span>
    <button
      class="border:surface-50 dark:hover:surface-50 dark:white text-surface-50 ml-4 rounded border px-3 py-1 text-sm tracking-wide hover:border-[#00237A] hover:bg-[#00237A]"
      >Try it now</button>
  </a>
{/key}
