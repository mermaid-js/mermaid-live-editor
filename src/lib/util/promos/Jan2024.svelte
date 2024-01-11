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
  class="tracking-wide flex-grow justify-center align-middle flex gap-6">
  {taglines[Math.floor(Math.random() * taglines.length)]}
  <button class="font-light text-sm p-1 rounded bg-gray-800 px-4">Try it now</button>
</a>
