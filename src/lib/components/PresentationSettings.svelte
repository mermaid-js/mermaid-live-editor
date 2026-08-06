<script lang="ts">
  import Card from '$/components/Card/Card.svelte';
  import { Button } from '$/components/ui/button';
  import { Input } from '$/components/ui/input';
  import * as ToggleGroup from '$/components/ui/toggle-group';
  import {
    getAccessibilityMetadata,
    getPresentationSettings,
    layoutOptions,
    lookOptions,
    setAccessibilityMetadata,
    updatePresentationConfig,
    type LayoutOption,
    type LookOption
  } from '$/util/presentation';
  import { updateCode, updateConfig, validatedState } from '$/util/state.svelte';
  import { cn } from '$lib/utils';
  import PaletteIcon from '~icons/material-symbols/palette-outline';
  import WarningIcon from '~icons/material-symbols/warning-outline-rounded';

  const labels: Record<LayoutOption | LookOption, string> = {
    classic: 'Classic',
    dagre: 'Dagre',
    default: 'Auto',
    elk: 'ELK',
    'elk.force': 'Force',
    'elk.stress': 'Stress',
    handDrawn: 'Hand',
    neo: 'Neo'
  };

  const settings = $derived.by(() => {
    try {
      return getPresentationSettings(validatedState.current.mermaid);
    } catch {
      return {
        layout: 'default',
        look: 'default'
      } satisfies ReturnType<typeof getPresentationSettings>;
    }
  });

  const accessibility = $derived(getAccessibilityMetadata(validatedState.current.code));
  const warnings = $derived(
    [
      !accessibility.title && 'Missing accTitle',
      !accessibility.description && 'Missing accDescr'
    ].filter(Boolean)
  );

  const updateSettings = (next: Partial<ReturnType<typeof getPresentationSettings>>) => {
    updateConfig(
      updatePresentationConfig(validatedState.current.mermaid, {
        ...settings,
        ...next
      })
    );
  };

  const updateAccessibility = (next: Partial<typeof accessibility>) => {
    updateCode(
      setAccessibilityMetadata(validatedState.current.code, {
        ...accessibility,
        ...next
      }),
      { updateDiagram: true }
    );
  };

  const updateHandDrawnSeed = (event: Event) => {
    const value = (event.currentTarget as HTMLInputElement).valueAsNumber;
    updateSettings({
      handDrawnSeed: Number.isFinite(value) ? value : undefined
    });
  };
</script>

<Card title="Presentation" isStackable icon={{ component: PaletteIcon }}>
  <div class="flex min-w-80 flex-col gap-4 p-3 text-sm">
    <div class="flex flex-col gap-2">
      <span class="font-medium">Layout</span>
      <ToggleGroup.Root
        type="single"
        variant="outline"
        class="flex-wrap justify-start"
        value={settings.layout}
        onValueChange={(value) => {
          if (layoutOptions.includes(value as LayoutOption)) {
            updateSettings({ layout: value as LayoutOption });
          }
        }}>
        {#each layoutOptions as layout (layout)}
          <ToggleGroup.Item value={layout}>{labels[layout]}</ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
    </div>

    <div class="flex flex-col gap-2">
      <span class="font-medium">Look</span>
      <ToggleGroup.Root
        type="single"
        variant="outline"
        class="flex-wrap justify-start"
        value={settings.look}
        onValueChange={(value) => {
          if (lookOptions.includes(value as LookOption)) {
            updateSettings({ look: value as LookOption });
          }
        }}>
        {#each lookOptions as look (look)}
          <ToggleGroup.Item value={look}>{labels[look]}</ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
      {#if settings.look === 'handDrawn'}
        <label class="flex items-center gap-2">
          <span class="w-20 shrink-0 text-muted-foreground">Seed</span>
          <Input
            type="number"
            min="0"
            value={settings.handDrawnSeed ?? ''}
            placeholder="Random"
            onchange={updateHandDrawnSeed} />
        </label>
      {/if}
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <span class="font-medium">Accessibility</span>
        {#if warnings.length > 0}
          <span class="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-300">
            <WarningIcon class="size-4" />
            {warnings.join(', ')}
          </span>
        {/if}
      </div>
      <Input
        value={accessibility.title}
        placeholder="Accessible title"
        onchange={(event) => {
          updateAccessibility({ title: (event.currentTarget as HTMLInputElement).value });
        }} />
      <textarea
        class={cn(
          'min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors',
          'placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none'
        )}
        value={accessibility.description}
        placeholder="Accessible description"
        onchange={(event) => {
          updateAccessibility({
            description: (event.currentTarget as HTMLTextAreaElement).value
          });
        }}></textarea>
      <Button
        variant="outline"
        size="sm"
        class="w-fit"
        disabled={Boolean(accessibility.title && accessibility.description)}
        onclick={() => {
          updateAccessibility({
            description:
              accessibility.description ||
              `Diagram rendered from ${validatedState.current.diagramType ?? 'Mermaid'} source.`,
            title: accessibility.title || 'Mermaid diagram'
          });
        }}>
        Fill missing
      </Button>
    </div>
  </div>
</Card>
