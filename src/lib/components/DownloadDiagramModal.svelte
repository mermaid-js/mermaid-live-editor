<script lang="ts">
  import { buttonVariants, Button } from '$/components/ui/button';
  import * as Dialog from '$/components/ui/dialog';
  import { notify } from '$/util/notify';
  import { downloadDiagram, isDownloadFormatSupported, type DownloadFormat } from '$/util/download';
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
      format: 'animated-svg',
      label: 'Animated SVG',
      description:
        'Animated vector export that matches the current frontend rendering more closely.'
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
    }
  ];

  let open = $state(false);
  let pendingFormat = $state<DownloadFormat | null>(null);

  const handleDownload = async (format: DownloadFormat) => {
    pendingFormat = format;

    try {
      await downloadDiagram(format, { imageSize: 1080, imageSizeMode: 'auto' });
      logEvent('download', { type: format, source: 'saveDiagramModal' });
    } catch (error) {
      console.error(error);
      notify(`Failed to save ${format.toUpperCase()}`);
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
                This export format is not supported in this environment.
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
