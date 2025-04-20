<script>
  import * as Dialog from '$/components/ui/dialog';
  import ShieldIcon from '~icons/material-symbols/shield-lock-outline-rounded';
</script>

<Dialog.Root>
  <Dialog.Trigger>
    <ShieldIcon />
  </Dialog.Trigger>
  <Dialog.Content class="max-h-full overflow-y-auto">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2 text-xl">
        <ShieldIcon class="size-8 text-green-700" />
        Data security
      </Dialog.Title>
    </Dialog.Header>

    <p class="text-xl font-semibold">
      The content of the diagrams you create never leaves your browser.
    </p>
    <p>It's only stored in the URL, and your browser's local storage.</p>
    <p>
      Mermaid Live Editor is a fully open source, client side application, deployed transparently on <a
        href="https://github.com/mermaid-js/mermaid-live-editor/deployments"
        class="underline"
        target="_blank">
        GitHub Pages
      </a>.
    </p>
    <p>
      It will also work as a fully offline
      <a href="https://web.dev/explore/progressive-web-apps" target="_blank">
        Progressive Web App.
      </a>
    </p>
    <p>
      The only server we have is a self hosted version of the open source and privacy friendly
      Plausible Analytics. We only collect anonymous data related to actions performed, like the
      type of diagram rendered, number of times a feature was used, etc.
    </p>
    <p>
      All the data we collect is anonymized and
      <a href="https://p.mermaid.live/mermaid.live" class="underline" target="_blank">
        available publicly.
      </a>
    </p>

    <p>
      Additional services like the external PNG/SVG/Kroki links and "Save to Mermaid Chart" feature
      will share your diagram with the respective 3rd party service.
    </p>
  </Dialog.Content>
</Dialog.Root>
