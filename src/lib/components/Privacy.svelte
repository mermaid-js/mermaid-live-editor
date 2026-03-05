<script>
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
      This is a privacy-focused fork with all external services disabled. No analytics, no external
      rendering services, no third-party connections. The app works entirely offline.
    </p>
    <p>
      No data is sent to any external server. All diagram rendering happens locally in your browser.
    </p>
  </Dialog.Content>
</Dialog.Root>
