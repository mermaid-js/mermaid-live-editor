<script lang="ts">
  import Card from '$/components/Card/Card.svelte';
  import { Button } from '$/components/ui/button';
  import { Input } from '$/components/ui/input';
  import * as ToggleGroup from '$/components/ui/toggle-group';
  import { browser } from '$app/environment';
  import { waitForRender } from '$lib/util/autoSync';
  import { env } from '$lib/util/env';
  import { pakoSerde } from '$lib/util/serde';
  import { stateStore } from '$lib/util/state';
  import { logEvent } from '$lib/util/stats';
  import { version as FAVersion } from '@fortawesome/fontawesome-free/package.json';
  import dayjs from 'dayjs';
  import { toBase64 } from 'js-base64';
  import CopyIcon from '~icons/material-symbols/content-copy-outline-rounded';
  import DownloadIcon from '~icons/material-symbols/download';
  import ExternalLinkIcon from '~icons/material-symbols/open-in-new-rounded';
  import WidthIcon from '~icons/material-symbols/width-rounded';
  import { Separator } from './ui/separator';

  const FONT_AWESOME_URL = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/${FAVersion}/css/all.min.css`;

  const { krokiRendererUrl, rendererUrl } = env;
  type Exporter = (context: CanvasRenderingContext2D, image: HTMLImageElement) => () => void;

  const getFileName = (extension: string) =>
    `mermaid-diagram-${dayjs().format('YYYY-MM-DD-HHmmss')}.${extension}`;

  const getBase64SVG = (svg?: HTMLElement, width?: number, height?: number): string => {
    if (svg) {
      // Prevents the SVG size of the interface from being changed
      svg = svg.cloneNode(true) as HTMLElement;
    }
    height && svg?.setAttribute('height', `${height}px`);
    width && svg?.setAttribute('width', `${width}px`); // Workaround https://stackoverflow.com/questions/28690643/firefox-error-rendering-an-svg-image-to-html5-canvas-with-drawimage
    if (!svg) {
      svg = getSvgElement();
    }
    const svgString = svg.outerHTML
      .replaceAll('<br>', '<br/>')
      .replaceAll(/<img([^>]*)>/g, (m, g: string) => `<img ${g} />`);

    return toBase64(`<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="${FONT_AWESOME_URL}" type="text/css"?>
${svgString}`);
  };

  const exportImage = async (event: Event, exporter: Exporter) => {
    await waitForRender();
    if (document.querySelector('.outOfSync')) {
      throw new Error('Diagram is out of sync');
    }
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const svg = document.querySelector<HTMLElement>('#container svg');
    if (!svg) {
      throw new Error('svg not found');
    }
    const box: DOMRect = svg.getBoundingClientRect();
    canvas.width = box.width;
    canvas.height = box.height;
    if (imageSizeMode === 'width') {
      const ratio = box.height / box.width;
      canvas.width = imageSize;
      canvas.height = imageSize * ratio;
    } else if (imageSizeMode === 'height') {
      const ratio = box.width / box.height;
      canvas.width = imageSize * ratio;
      canvas.height = imageSize;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('context not found');
    }
    context.fillStyle = `hsl(${window.getComputedStyle(document.body).getPropertyValue('--b1')})`;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const image = new Image();
    image.addEventListener('load', exporter(context, image));
    image.src = `data:image/svg+xml;base64,${getBase64SVG(svg, canvas.width, canvas.height)}`;

    event.stopPropagation();
    event.preventDefault();
  };

  const getSvgElement = () => {
    const svgElement = document.querySelector('#container svg')?.cloneNode(true) as HTMLElement;
    svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    return svgElement;
  };

  const simulateDownload = (download: string, href: string): void => {
    const a = document.createElement('a');
    a.download = download;
    a.href = href;
    a.click();
    a.remove();
  };
  const downloadImage: Exporter = (context, image) => {
    return () => {
      const { canvas } = context;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      simulateDownload(
        getFileName('png'),
        canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
      );
    };
  };

  const isClipboardAvailable = (): boolean => {
    return Object.prototype.hasOwnProperty.call(window, 'ClipboardItem') as boolean;
  };

  const clipboardCopy: Exporter = (context, image) => {
    return () => {
      const { canvas } = context;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        try {
          if (!blob) {
            throw new Error('blob is empty');
          }
          void navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
        } catch (error) {
          console.error(error);
        }
      });
    };
  };

  const onCopyClipboard = async (event: Event) => {
    await exportImage(event, clipboardCopy);
    logEvent('copyClipboard');
  };

  const onDownloadPNG = async (event: Event) => {
    await exportImage(event, downloadImage);
    logEvent('download', {
      type: 'png'
    });
  };

  const onDownloadSVG = () => {
    simulateDownload(getFileName('svg'), `data:image/svg+xml;base64,${getBase64SVG()}`);
    logEvent('download', {
      type: 'svg'
    });
  };

  const onCopyMarkdown = () => {
    document.querySelector<HTMLInputElement>('#markdown')?.select();
    document.execCommand('Copy');
    logEvent('copyMarkdown');
  };

  let gistURL = $state('');
  stateStore.subscribe(({ loader }) => {
    if (loader?.type === 'gist') {
      // @ts-expect-error Gist will have url
      gistURL = loader.config.url;
    }
  });

  const loadGist = () => {
    if (!gistURL) {
      alert('Please enter a Gist URL first');
    }
    window.location.href = `${window.location.pathname}?gist=${gistURL}`;
    logEvent('loadGist');
  };

  let iUrl: string | undefined = $state();
  let svgUrl: string | undefined = $state();
  let krokiUrl: string | undefined = $state();
  let mdCode: string | undefined = $state();
  let imageSizeMode: 'auto' | 'width' | 'height' = $state('auto');

  $effect(() => {
    if (!imageSizeMode) {
      imageSizeMode = 'auto';
    }
  });

  let imageSize = $state(1080);

  let isNetlify = $state(false);
  if (browser && ['mermaid.live', 'netlify'].some((path) => window.location.host.includes(path))) {
    isNetlify = true;
  }
  stateStore.subscribe(({ code, serialized }) => {
    iUrl = `${rendererUrl}/img/${serialized}?type=png`;
    svgUrl = `${rendererUrl}/svg/${serialized}`;
    krokiUrl = `${krokiRendererUrl}/mermaid/svg/${pakoSerde.serialize(code)}`;
    mdCode = `[![](${iUrl})](${window.location.protocol}//${window.location.host}${window.location.pathname}#${serialized})`;
  });
</script>

{#snippet dualActionButton(text: string, download: (event: Event) => unknown, url?: string)}
  <div class="flex flex-grow gap-0.5">
    <Button class="flex-grow rounded-r-none" onclick={download}>
      <DownloadIcon />{text}
    </Button>
    {#if url}
      <Button class="rounded-l-none" href={url} target="_blank" rel="noreferrer">
        <ExternalLinkIcon />
      </Button>
    {/if}
  </div>
{/snippet}

<Card title="Actions" isStackable icon={{ component: DownloadIcon, class: 'rotate-180' }}>
  <div class="flex min-w-fit flex-col gap-2 p-2">
    <div class="flex w-full items-center gap-2 whitespace-nowrap py-2">
      PNG size
      <ToggleGroup.Root type="single" variant="outline" bind:value={imageSizeMode}>
        <ToggleGroup.Item value="auto">Auto</ToggleGroup.Item>
        <ToggleGroup.Item value="width">Width</ToggleGroup.Item>
        <ToggleGroup.Item value="height">Height</ToggleGroup.Item>
      </ToggleGroup.Root>
      <!-- <Separator orientation="vertical" />
      <span class="flex items-center gap-2">
        Auto
        <Switch id="autosize" bind:checked={isAutoImageMode} />
      </span> -->

      <!-- {#if } -->
      {#if imageSizeMode !== 'auto'}
        <div>
          <WidthIcon class="{imageSizeMode === 'width' ? '' : 'rotate-90'} size-6 transition-all" />
        </div>
      {/if}
      <Input
        type="number"
        min="3"
        max="10000"
        disabled={imageSizeMode === 'auto'}
        bind:value={imageSize} />
      <!-- {/if} -->
    </div>
    <div class="flex gap-2">
      {@render dualActionButton('PNG', onDownloadPNG, iUrl)}
      {@render dualActionButton('SVG', onDownloadSVG, svgUrl)}

      {#if krokiRendererUrl}
        <a target="_blank" rel="noreferrer" class="flex-grow" href={krokiUrl}>
          <Button class="action-btn w-full">
            <ExternalLinkIcon class="mr-2" /> Kroki
          </Button>
        </a>
      {/if}
    </div>
    <Separator />
    {#if isClipboardAvailable()}
      <Button onclick={onCopyClipboard}>
        <CopyIcon /> Copy Image
      </Button>
    {/if}
    {#if rendererUrl}
      <div class="flex w-full items-center gap-2">
        <Input type="text" value={mdCode} onclick={onCopyMarkdown} />
        <Button onclick={onCopyMarkdown}><CopyIcon /> Copy Markdown</Button>
      </div>
    {/if}

    <div class="flex w-full items-center gap-2">
      <Input type="url" bind:value={gistURL} placeholder="Enter Gist URL" />
      <Button onclick={loadGist}>Load Gist</Button>
    </div>
    {#if isNetlify}
      <div class="flex w-full items-center justify-center">
        <a class="link text-sm text-gray-500 underline" href="https://netlify.com">
          This site is powered by Netlify
        </a>
      </div>
    {/if}
  </div>
</Card>
