<script lang="ts">
  import { buttonVariants, Button } from '$/components/ui/button';
  import * as Dialog from '$/components/ui/dialog';
  import { notify } from '$/util/notify';
  import {
    GifExportError,
    downloadDiagram,
    isDownloadFormatSupported,
    type DownloadFormat
  } from '$/util/download';
  import { logEvent } from '$/util/stats';
  import DownloadIcon from '~icons/material-symbols/download';

  interface DownloadOption {
    description: string;
    format: DownloadFormat;
    label: string;
  }

  const options: DownloadOption[] = [
    {
      format: 'svg',
      label: 'SVG',
      description: 'Vector format, best for editing and scaling.'
    },
    {
      format: 'png',
      label: 'PNG',
      description: 'Lossless image, good for docs and chat.'
    },
    {
      format: 'jpeg',
      label: 'JPG',
      description: 'Smaller file size for static previews.'
    },
    {
      format: 'webp',
      label: 'WEBP',
      description: 'Modern compressed image when browser supports it.'
    },
    {
      format: 'gif',
      label: 'GIF',
      description: 'Animated GIF rendered by the Mermaid Beauty service.'
    }
  ];

  let open = $state(false);
  let pendingFormat = $state<DownloadFormat | null>(null);
  let gifStatus = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
  let gifMessage = $state('');

  const gifStatusMessage = (error: GifExportError): string => {
    switch (error.code) {
      case 'complexity_budget_exceeded':
        return 'This diagram is too complex to render as an animated GIF synchronously.';
      case 'too_many_active_renders':
      case 'rate_limited':
        return 'Too many animated GIF renders are running right now. Please retry in a moment.';
      case 'render_timeout':
        return 'Animated GIF rendering took too long and was stopped.';
      case 'timeline_planning_failed':
        return 'The current diagram could not be converted into a stable animation sequence.';
      case 'render_engine_unavailable':
        return 'The Mermaid Beauty render engine is temporarily unavailable.';
      default:
        return error.message || 'Animated GIF export failed.';
    }
  };

  const handleDownload = async (format: DownloadFormat) => {
    pendingFormat = format;
    if (format === 'gif') {
      gifStatus = 'loading';
      gifMessage = 'Generating animated GIF...';
    }

    try {
      await downloadDiagram(format, { imageSize: 1080, imageSizeMode: 'auto' });
      logEvent('download', { type: format, source: 'saveDiagramModal' });
      if (format === 'gif') {
        gifStatus = 'success';
        gifMessage = 'Animated GIF download started.';
      }
    } catch (error) {
      console.error(error);
      if (format === 'gif' && error instanceof GifExportError) {
        gifStatus = 'error';
        gifMessage = gifStatusMessage(error);
      } else {
        notify(`Failed to save ${format.toUpperCase()}`);
      }
    } finally {
      pendingFormat = null;
    }
  };
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger class={[buttonVariants({ variant: 'accent', size: 'sm' }), 'cursor-pointer']}>
    <DownloadIcon />
    Save diagram
  </Dialog.Trigger>

  <Dialog.Content class="max-w-2xl">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2 text-xl">
        <DownloadIcon class="size-5" />
        Save diagram locally
      </Dialog.Title>
      <Dialog.Description>
        Choose a format to download the current diagram directly to your machine.
      </Dialog.Description>
    </Dialog.Header>

    {#if gifStatus !== 'idle'}
      <div
        class={[
          'rounded-md border px-4 py-3 text-sm',
          gifStatus === 'error'
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : gifStatus === 'success'
              ? 'border-accent/30 bg-accent/10 text-accent'
              : 'border-border bg-muted/60 text-foreground'
        ]}>
        <span class="font-medium">GIF export:</span>
        {gifMessage}
      </div>
    {/if}

    <div class="grid gap-3 sm:grid-cols-2">
      {#each options as option (option.format)}
        {@const supported = isDownloadFormatSupported(option.format)}
        <Button
          class={[
            buttonVariants({ variant: 'outline' }),
            'h-auto items-start justify-start px-4 py-4 text-left whitespace-normal',
            supported && !pendingFormat ? 'cursor-pointer' : 'cursor-not-allowed'
          ]}
          disabled={!supported || !!pendingFormat}
          onclick={() => handleDownload(option.format)}>
          <div class="flex flex-col items-start gap-1">
            <span class="text-sm font-semibold">{option.label}</span>
            <span class="text-muted-foreground text-xs whitespace-normal">
              {#if supported}
                {option.description}
              {:else}
                GIF export service is not configured for this environment.
              {/if}
            </span>
            {#if pendingFormat === option.format}
              <span class="text-accent text-xs">Preparing download...</span>
            {/if}
          </div>
        </Button>
      {/each}
    </div>
  </Dialog.Content>
</Dialog.Root>
