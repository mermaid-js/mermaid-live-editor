<script lang="ts">
  import { buttonVariants } from '$/components/ui/button';
  import * as Dialog from '$/components/ui/dialog';
  import { Input } from '$/components/ui/input';
  import { Separator } from '$/components/ui/separator';
  import { Switch } from '$/components/ui/switch';
  import * as ToggleGroup from '$/components/ui/toggle-group';
  import { MERMAID_LOOKS, MERMAID_THEMES, TID } from '$/constants';
  import { isDarkTheme, type EmbedMode } from '$/util/embed';
  import { EMBED_IFRAME_SANDBOX, buildEmbedSnippets, buildEmbedUrls } from '$/util/embedCode';
  import { env } from '$/util/env';
  import { silentlySanitizeConfig } from '$/util/sanitize';
  import { urls, validatedState } from '$/util/state.svelte';
  import { copyToClipboard } from '$/util/util';
  import { asset, base } from '$app/paths';
  import CodeIcon from '~icons/material-symbols/code';
  import ShareIcon from '~icons/material-symbols/share';
  import CopyButton from './CopyButton.svelte';
  import CopyInput from './CopyInput.svelte';
  import MermaidChartIcon from './MermaidChartIcon.svelte';

  const sanitizedConfig = $derived(silentlySanitizeConfig(validatedState.current.mermaid));
  // Deliberate initial-value capture: the embed form seeds from the config at
  // mount time and then owns its values.
  // svelte-ignore state_referenced_locally
  const initialConfig = sanitizedConfig;
  const initialTheme = (initialConfig.theme as string | undefined) ?? 'default';
  let theme = $state(initialTheme);
  let look = $state((initialConfig.look as string | undefined) ?? 'classic');
  let mode = $state<EmbedMode>(isDarkTheme(initialTheme) ? 'dark' : 'light');
  let controls = $state(true);
  let grid = $state(true);
  let width = $state('100%');
  let height = $state('480');
  let format = $state<'iframe' | 'webComponent'>('iframe');
  let showPreview = $state(false);

  // The expensive half (config sanitize + pako serialize) is independent of
  // width/height, so typing in the size inputs only re-runs the snippet strings.
  const embedUrls = $derived(
    buildEmbedUrls({
      code: validatedState.current.code,
      config: sanitizedConfig,
      controls,
      grid,
      host: window.location.origin + base,
      look,
      mode,
      theme
    })
  );
  const snippets = $derived(buildEmbedSnippets(embedUrls, { height, width }));
  const snippet = $derived(format === 'webComponent' ? snippets.webComponent : snippets.iframe);
</script>

<Dialog.Root>
  <Dialog.Trigger class={buttonVariants({ size: 'sm' })}>Share</Dialog.Trigger>
  <Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-xl">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2 text-xl">
        <ShareIcon class="size-5" /> Shareable links
      </Dialog.Title>
      <Dialog.Description>Share your diagrams with others.</Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <h2 class="flex items-center gap-2">
          <img class="size-5" src={asset('/favicon.svg')} alt="Mermaid Live Editor" />
          Mermaid Live Editor
        </h2>
        <CopyInput value={window.location.href} />
        <Dialog.Description>
          The content of the diagrams you create never leaves your browser.
        </Dialog.Description>
      </div>
      {#if env.isEnabledMermaidChartLinks}
        <Separator />
        <div class="flex flex-col gap-2">
          <h2 class="flex items-center gap-2">
            <MermaidChartIcon class="size-5" />
            Mermaid Chart Playground
          </h2>
          <CopyInput value={urls.current.mermaidChart({ medium: 'share' }).playground} />
          <Dialog.Description>
            Opens the Mermaid Chart Playground with Mermaid AI, Visual Editor, and more.
          </Dialog.Description>
        </div>
      {/if}
      <Separator />
      <div class="flex flex-col gap-3">
        <h2 class="flex items-center gap-2">
          <CodeIcon class="size-5" />
          Embed
        </h2>
        <Dialog.Description>
          Embed a live, interactive diagram in your own website or blog.
        </Dialog.Description>
        <div class="grid grid-cols-2 gap-3">
          <label class="flex flex-col gap-1 text-sm">
            Theme
            <select
              bind:value={theme}
              class="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
              {#each MERMAID_THEMES as themeName (themeName)}
                <option value={themeName}>{themeName}</option>
              {/each}
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Look
            <select
              bind:value={look}
              class="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
              {#each MERMAID_LOOKS as lookName (lookName)}
                <option value={lookName}>{lookName}</option>
              {/each}
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Width
            <Input bind:value={width} />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Height
            <Input bind:value={height} />
          </label>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <ToggleGroup.Root
            type="single"
            variant="outline"
            value={mode}
            onValueChange={(value) => {
              if (value === 'light' || value === 'dark') {
                mode = value;
              }
            }}>
            <ToggleGroup.Item value="light">Light</ToggleGroup.Item>
            <ToggleGroup.Item value="dark">Dark</ToggleGroup.Item>
          </ToggleGroup.Root>
          <label class="flex items-center gap-2 text-sm">
            <Switch bind:checked={controls} />
            Controls
          </label>
          <label class="flex items-center gap-2 text-sm">
            <Switch bind:checked={grid} />
            Grid
          </label>
          <label class="flex items-center gap-2 text-sm">
            <Switch bind:checked={showPreview} />
            Preview
          </label>
        </div>
        {#if showPreview}
          <iframe
            data-testid={TID.embedPreview}
            src={embedUrls.url}
            title="Embed preview"
            class="h-52 w-full rounded-lg border"
            sandbox={EMBED_IFRAME_SANDBOX}></iframe>
        {/if}
        <div class="flex items-start gap-2">
          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <ToggleGroup.Root
              type="single"
              variant="outline"
              value={format}
              onValueChange={(value) => {
                if (value === 'iframe' || value === 'webComponent') {
                  format = value;
                }
              }}>
              <ToggleGroup.Item value="iframe">iframe</ToggleGroup.Item>
              <ToggleGroup.Item value="webComponent">Web component</ToggleGroup.Item>
            </ToggleGroup.Root>
            <textarea
              data-testid={TID.embedSnippet}
              readonly
              rows="4"
              class="w-full rounded-md border border-input bg-background p-2 font-mono text-xs text-foreground"
              value={snippet}></textarea>
          </div>
          <CopyButton onclick={() => copyToClipboard(snippet)} />
        </div>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
