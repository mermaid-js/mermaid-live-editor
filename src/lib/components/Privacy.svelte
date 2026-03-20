<script>
  import ExternalLinkWrapper from '$/components/ExternalLinkWrapper.svelte';
  import * as Dialog from '$/components/ui/dialog';
  import { env } from '$/util/env';
  import { isOnMermaidLive } from '$/util/migration/domainMigration';
  import ShieldIcon from '~icons/material-symbols/shield-lock-outline-rounded';
</script>

{#if env.privacyPolicyUrl}
  <a href={env.privacyPolicyUrl} target="_blank" class="cursor-pointer">
    <ShieldIcon />
  </a>
{:else}
  <Dialog.Root>
    <Dialog.Trigger class="cursor-pointer">
      <ShieldIcon />
    </Dialog.Trigger>
    <Dialog.Content class="max-h-full overflow-hidden overflow-y-auto p-12">
      <Dialog.Header>
        <Dialog.Title class="flex items-center gap-2 text-xl">
          <ShieldIcon class="size-8 text-green-700" />
          Data security
        </Dialog.Title>
      </Dialog.Header>

      {#if isOnMermaidLive()}
        <p class="text-xl font-semibold">Your diagrams never leave your browser.</p>
        <p>They're only stored in the URL and your browser's local storage.</p>
        <p>
          This is a fully open source, client-side app deployed on <a
            href="https://github.com/mermaid-js/mermaid-live-editor/deployments"
            class="underline"
            target="_blank">GitHub Pages</a>
          that works offline as a
          <a href="https://web.dev/explore/progressive-web-apps" target="_blank"
            >Progressive Web App</a
          >.
        </p>
        <p>
          We use self hosted, privacy-friendly Plausible Analytics to collect anonymous usage
          metadata (diagram types, feature usage, etc.). All data is <a
            href="https://p.mermaid.live/mermaid.live"
            class="underline"
            target="_blank">publicly available</a
          >.
        </p>
        <ExternalLinkWrapper domain="example.com" isVisible>
          <p class="text-left">
            External services (PNG/SVG/Kroki exports, "Save to Mermaid Chart", "Repair with AI",
            etc) will share your diagram with those 3rd parties, and are highlighted in the UI on
            hover.
          </p>
        </ExternalLinkWrapper>
      {:else}
        <p>No privacy policy has been configured for this deployment.</p>
        <p>
          If you are self-hosting the Mermaid Live Editor, set the
          <code class="bg-muted rounded px-1.5 py-0.5 text-sm">MERMAID_PRIVACY_POLICY_URL</code>
          environment variable at build time to link to your privacy policy, or set
          <code class="bg-muted rounded px-1.5 py-0.5 text-sm">MERMAID_HIDE_PRIVACY_POLICY</code>
          to <code class="bg-muted rounded px-1.5 py-0.5 text-sm">true</code> to hide this button.
        </p>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
{/if}
