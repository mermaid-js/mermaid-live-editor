<script lang="ts">
  const taglines = [
    'Try diagramming with ChatGPT at Mermaid Chart',
    "Try Mermaid's Visual Editor at Mermaid Chart",
    'Enjoy live collaboration with teammates at Mermaid Chart'
  ];
</script>

<a
  href="https://www.mermaidchart.com/"
  target="_blank"
  class="flex flex-grow justify-center gap-6 align-middle tracking-wide">
  {taglines[Math.floor(Math.random() * taglines.length)]}
  <button class="rounded bg-gray-800 p-1 px-4 text-sm font-light">Try it now</button>
</a>
