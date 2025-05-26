<script lang="ts">
  import Card from '$/components/Card/Card.svelte';
  import CopyButton from '$/components/CopyButton.svelte';
  import CopyInput from '$/components/CopyInput.svelte';
  import { Button } from '$/components/ui/button';
  import { Input } from '$/components/ui/input';
  import { Separator } from '$/components/ui/separator';
  import * as ToggleGroup from '$/components/ui/toggle-group';
  import { TID } from '$/constants';
  import { env } from '$/util/env';
  import { browser } from '$app/environment';
  import { waitForRender } from '$lib/util/autoSync';
  import { inputStateStore, stateStore, urlsStore } from '$lib/util/state';
  import { logEvent } from '$lib/util/stats';
  import { version as FAVersion } from '@fortawesome/fontawesome-free/package.json';
  import dayjs from 'dayjs';
  import { toBase64 } from 'js-base64';
  import DownloadIcon from '~icons/material-symbols/download';
  import ExternalLinkIcon from '~icons/material-symbols/open-in-new-rounded';
  import WidthIcon from '~icons/material-symbols/width-rounded';

  const fontAwesomeURLs = (() => {
    const baseUrl = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/${FAVersion}`;
    return {
      css: `${baseUrl}/css/all.min.css`,
      woff2: `${baseUrl}/webfonts/fa-solid-900.woff2`
    };
  })();

  type Exporter = (context: CanvasRenderingContext2D, image: HTMLImageElement) => () => void;

  const getFileName = (extension: string) =>
    `mermaid-diagram-${dayjs().format('YYYY-MM-DD-HHmmss')}.${extension}`;

  const getSvgElement = async () => {
    try {
      $inputStateStore.panZoom = false;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await waitForRender();
      const svgElement = document.querySelector('#container svg');
      if (!svgElement) {
        throw new Error('svg not found');
      }
      svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      return {
        svg: svgElement.cloneNode(true) as HTMLElement,
        box: svgElement.querySelector('g')!.getBoundingClientRect()
      };
    } finally {
      setTimeout(() => {
        $inputStateStore.panZoom = true;
      }, 10000);
    }
  };

  const injectFontAwesome = async ({
    svgString,
    fontAwesomeEmbedMode
  }: {
    svgString: string;
    fontAwesomeEmbedMode: 'raw' | 'url';
  }) => {
    if (fontAwesomeEmbedMode === 'url') {
      return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="${fontAwesomeURLs.css}" type="text/css"?>
${svgString}`;
    }

    const [fontAwesomeCSS, fontBlob] = await Promise.all([
      fetch(fontAwesomeURLs.css).then((response) => response.text()),
      fetch(fontAwesomeURLs.woff2).then((res) => res.blob())
    ]);
    const reader = new FileReader();
    const fontBase64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix (data:application/octet-stream;base64,)
        resolve(base64.split(',')[1]);
      };
      reader.readAsDataURL(fontBlob);
    });
    const styleString = `
@font-face {
  font-family: 'Font Awesome 6 Free';
  font-style: normal;
  font-weight: 900;
  src: url(data:font/woff2;base64,${fontBase64}) format('woff2');
}

.fa {
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
  // TODO: Make this dynamic from config
  font-size: 16px;
  width: 16px;
  fill: black;
}

${fontAwesomeCSS}
`;
    return svgString.replace('<style>', `<style>${styleString}`);
  };

  const getBase64SVG = async ({
    svg,
    box,
    width,
    height,
    embedFontAwesome
  }: {
    svg?: HTMLElement;
    box?: DOMRect;
    width?: number;
    height?: number;
    embedFontAwesome?: boolean;
  } = {}): Promise<string> => {
    if (!svg || !box) {
      ({ svg, box } = await getSvgElement());
    }

    console.log(box);
    // Prevents the SVG size of the interface from being changed
    // svg = svg.cloneNode(true) as HTMLElement;

    height && svg.setAttribute('height', `${height}px`);
    width && svg.setAttribute('width', `${width}px`); // Workaround https://stackoverflow.com/questions/28690643/firefox-error-rendering-an-svg-image-to-html5-canvas-with-drawimage
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const svgString = svg.outerHTML
      .replaceAll('<br>', '<br/>')
      .replaceAll(/<img([^>]*)>/g, (m, g: string) => `<img ${g} />`);

    const svgStringWithFontAwesome = await injectFontAwesome({
      svgString,
      fontAwesomeEmbedMode: embedFontAwesome ? 'raw' : 'url'
    });

    console.log(svgStringWithFontAwesome);
    return toBase64(svgStringWithFontAwesome);
  };

  const simulateDownload = (download: string, href: string): void => {
    const a = document.createElement('a');
    a.download = download;
    a.href = href;
    a.click();
    a.remove();
  };

  const exportImage = async (event: Event, exporter: Exporter) => {
    event.stopPropagation();
    event.preventDefault();
    const canvas = document.createElement('canvas');
    const { svg, box } = await getSvgElement();

    if (imageSizeMode === 'width') {
      const ratio = box.height / box.width;
      canvas.width = imageSize;
      canvas.height = imageSize * ratio;
    } else if (imageSizeMode === 'height') {
      const ratio = box.width / box.height;
      canvas.width = imageSize * ratio;
      canvas.height = imageSize;
    } else {
      const multiplier = 2;
      canvas.width = box.width * multiplier;
      canvas.height = box.height * multiplier;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('context not found');
    }

    context.fillStyle = `hsl(${window.getComputedStyle(document.body).getPropertyValue('--background')})`;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const image = new Image();
    image.addEventListener('load', () => {
      exporter(context, image)();
    });
    image.src = `data:image/svg+xml;base64,${await getBase64SVG({ svg, box, height: canvas.height, width: canvas.width, embedFontAwesome: true })}`;
    // Fallback to set panZoom to true after 2 seconds
    // This is a workaround for the case when the image is not loaded
    // setTimeout(() => {
    //   if (!$inputStateStore.panZoom) {
    //   }
    // }, 2000);
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
    return Object.prototype.hasOwnProperty.call(window, 'ClipboardItem');
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

  const onDownloadSVG = async () => {
    simulateDownload(getFileName('svg'), `data:image/svg+xml;base64,${await getBase64SVG()}`);
    logEvent('download', {
      type: 'svg'
    });
  };

  let gistURL = $state('');
  stateStore.subscribe(({ loader }) => {
    if (loader?.type === 'gist') {
      gistURL = loader.config.url;
    }
  });

  const loadGist = () => {
    if (!gistURL) {
      return alert('Please enter a Gist URL first');
    }
    window.location.href = `${window.location.pathname}?gist=${gistURL}`;
    logEvent('loadGist');
  };

  let imageSizeMode: 'auto' | 'width' | 'height' = $state('auto');

  $effect(() => {
    if (!imageSizeMode) {
      imageSizeMode = 'auto';
    }
  });

  let imageSize = $state(1080);

  const isNetlify = browser && window.location.host.includes('netlify');
</script>

{#snippet dualActionButton(text: string, download: (event: Event) => unknown, url?: string)}
  <div class="flex flex-grow gap-0.5">
    <Button
      class={['flex-grow', url && 'rounded-r-none']}
      onclick={download}
      data-testid="download-{text}">
      <DownloadIcon />
      {text}
    </Button>
    {#if url}
      <Button class="rounded-l-none" href={url} target="_blank" rel="noreferrer noopener">
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
      {#if imageSizeMode !== 'auto'}
        <WidthIcon
          class={['size-6 shrink-0 transition-all', imageSizeMode === 'width' && 'rotate-90']} />
      {/if}
      <Input
        type="number"
        min="3"
        max="10000"
        disabled={imageSizeMode === 'auto'}
        bind:value={imageSize} />
    </div>
    <div class="flex gap-2">
      {@render dualActionButton('PNG', onDownloadPNG, $urlsStore.png)}
      {@render dualActionButton('SVG', onDownloadSVG, $urlsStore.svg)}
      {#if env.krokiRendererUrl}
        <a target="_blank" rel="noreferrer" class="flex-grow" href={$urlsStore.kroki}>
          <Button class="action-btn flex w-full items-center gap-2">
            <ExternalLinkIcon /> Kroki
          </Button>
        </a>
      {/if}
    </div>
    <Separator />
    {#if isClipboardAvailable()}
      <CopyButton onclick={onCopyClipboard} label="Copy Image" />
    {/if}
    {#if $urlsStore.mdCode}
      <CopyInput value={$urlsStore.mdCode} label="Copy Markdown" testID={TID.copyMarkdown} />
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
