<script>
  import ExternalLinkWrapper from '$/components/ExternalLinkWrapper.svelte';
  import * as Dialog from '$/components/ui/dialog';
  import ShieldIcon from '~icons/material-symbols/shield-lock-outline-rounded';
</script>

<Dialog.Root>
  <Dialog.Trigger>
    <ShieldIcon />
  </Dialog.Trigger>
  <Dialog.Content class="max-h-full overflow-hidden overflow-y-auto p-12">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2 text-xl">
        <ShieldIcon class="size-8 text-green-700" />
        Data security
      </Dialog.Title>
    </Dialog.Header>

    <p class="text-xl font-semibold">Your diagrams never leave your browser.</p>
    <p>They're only stored in the URL and your browser's local storage.</p>
    <p>
      This is a fully open source, client-side app deployed on <a
        href="https://github.com/mermaid-js/mermaid-live-editor/deployments"
        class="underline"
        target="_blank">GitHub Pages</a>
      that works offline as a
      <a href="https://web.dev/explore/progressive-web-apps" target="_blank">Progressive Web App</a
      >.
    </p>
    <p>
      We use self hosted, privacy-friendly Plausible Analytics to collect anonymous usage metadata
      (diagram types, feature usage, etc.). All data is <a
        href="https://p.mermaid.live/mermaid.live"
        class="underline"
        target="_blank">publicly available</a
      >.
    </p>
    <ExternalLinkWrapper domain="example.com" isVisible>
      <p class="text-left">
        External services (PNG/SVG/Kroki exports, "Save to Mermaid Chart", "Repair with AI", etc)
        will share your diagram with those 3rd parties, and are highlighted in the UI on hover.
      </p>
    </ExternalLinkWrapper>
  </Dialog.Content>
</Dialog.Root>
