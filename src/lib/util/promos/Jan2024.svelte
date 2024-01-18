<script lang="ts">
  const taglines = {
    announcement_bar_ai_diagramming: 'Try diagramming with ChatGPT at Mermaid Chart',
    announcement_bar_visual_editor: "Try Mermaid's Visual Editor at Mermaid Chart",
    announcement_bar_live_collaboration: 'Enjoy live collaboration with teammates at Mermaid Chart'
  };
  const taglineKeys = Object.keys(taglines);
  const taglineKey = taglineKeys[Math.floor(Math.random() * taglineKeys.length)];
  const tagline = taglines[taglineKey];
  const url =
    'https://www.mermaidchart.com/?' +
    new URLSearchParams({
      utm_source: 'mermaid_live_editor',
      utm_medium: taglineKey,
      utm_campaign: 'promo_2024'
    }).toString();
</script>

<a
  href={url}
  target="_blank"
  class="flex flex-grow justify-center gap-6 align-middle tracking-wide">
  {tagline}
  <button class="rounded bg-gray-800 p-1 px-4 text-sm font-light">Try it now</button>
</a>
