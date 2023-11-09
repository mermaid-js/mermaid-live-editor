<script lang="ts">
  import { browser } from '$app/environment';
  import Card from '$lib/components/Card/Card.svelte';
  import { env } from '$lib/util/env';
  import { pakoSerde } from '$lib/util/serde';
  import { stateStore } from '$lib/util/state';
  import { logEvent } from '$lib/util/stats';
  import { toBase64 } from 'js-base64';
  import dayjs from 'dayjs';
  const { krokiRendererUrl, rendererUrl } = env;

  type Exporter = (context: CanvasRenderingContext2D, image: HTMLImageElement) => () => void;

  const getFileName = (ext: string) =>
    `mermaid-diagram-${dayjs().format('YYYY-MM-DD-HHmmss')}.${ext}`;

  const getBase64SVG = (svg?: HTMLElement, width?: number, height?: number): string => {
    if (svg) {
      // Prevents the SVG size of the interface from being changed
      svg = svg.cloneNode(true) as HTMLElement;
    }
    height && svg?.setAttribute('height', `${height}px`);
    width && svg?.setAttribute('width', `${width}px`); // Workaround https://stackoverflow.com/questions/28690643/firefox-error-rendering-an-svg-image-to-html5-canvas-with-drawimage
    if (!svg) {
      svg = getSvgEl();
    }
    const svgString = svg.outerHTML
      .replaceAll('<br>', '<br/>')
      .replaceAll(/<img([^>]*)>/g, (m, g: string) => `<img ${g} />`);
    return toBase64(svgString);
  };

  const exportImage = (event: Event, exporter: Exporter) => {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const svg: HTMLElement | null = document.querySelector('#container svg');
    if (!svg) {
      throw new Error('svg not found');
    }
    const box: DOMRect = svg.getBoundingClientRect();
    canvas.width = box.width;
    canvas.height = box.height;
    if (imagemodeselected === 'width') {
      const ratio = box.height / box.width;
      canvas.width = userimagesize;
      canvas.height = userimagesize * ratio;
    } else if (imagemodeselected === 'height') {
      const ratio = box.width / box.height;
      canvas.width = userimagesize * ratio;
      canvas.height = userimagesize;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('context not found');
    }
    context.fillStyle = `hsl(${window.getComputedStyle(document.body).getPropertyValue('--b1')})`;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const image = new Image();
    image.onload = exporter(context, image);
    image.src = `data:image/svg+xml;base64,${getBase64SVG(svg, canvas.width, canvas.height)}`;

    event.stopPropagation();
    event.preventDefault();
  };

  const getSvgEl = () => {
    const svgEl: HTMLElement = document
      .querySelector('#container svg')!
      .cloneNode(true) as HTMLElement;
    svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    const fontAwesomeCdnUrl = Array.from(document.head.getElementsByTagName('link'))
      .map((l) => l.href)
      .find((h) => h.includes('font-awesome'));
    if (fontAwesomeCdnUrl == null) {
      return svgEl;
    }
    const styleEl = document.createElement('style');
    styleEl.innerText = `@import url("${fontAwesomeCdnUrl}");'`;
    svgEl.prepend(styleEl);
    return svgEl;
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

  const onCopyClipboard = (event: Event) => {
    exportImage(event, clipboardCopy);
    logEvent('copyClipboard');
  };

  const onDownloadPNG = (event: Event) => {
    exportImage(event, downloadImage);
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
    (document.getElementById('markdown') as HTMLInputElement).select();
    document.execCommand('Copy');
    logEvent('copyMarkdown');
  };

  let gistURL = '';
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

  let iUrl: string;
  let svgUrl: string;
  let krokiUrl: string;
  let mdCode: string;
  let imagemodeselected = 'auto';
  let userimagesize = 1080;

  let isNetlify = false;
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

<Card title="Actions" isOpen={false}>
  <div class="flex flex-wrap gap-2 m-2">
    {#if isClipboardAvailable()}
      <button class="action-btn w-full" on:click={onCopyClipboard}
        ><i class="far fa-copy mr-2" /> Copy Image to clipboard
      </button>
    {/if}
    <button id="downloadPNG" class="action-btn flex-grow" on:click={onDownloadPNG}>
      <i class="fas fa-download mr-2" /> PNG
    </button>
    <button id="downloadSVG" class="action-btn flex-grow" on:click={onDownloadSVG}>
      <i class="fas fa-download mr-2" /> SVG
    </button>
    <a target="_blank" rel="noreferrer" class="flex-grow" href={iUrl}>
      <button class="action-btn w-full">
        <i class="fas fa-external-link-alt mr-2" /> PNG
      </button>
    </a>
    <a target="_blank" rel="noreferrer" class="flex-grow" href={svgUrl}>
      <button class="action-btn w-full">
        <i class="fas fa-external-link-alt mr-2" /> SVG
      </button>
    </a>
    <a target="_blank" rel="noreferrer" class="flex-grow" href={krokiUrl}>
      <button class="action-btn w-full">
        <i class="fas fa-external-link-alt mr-2" /> Kroki
      </button>
    </a>

    <div class="flex gap-2 items-center">
      PNG size
      <label for="autosize">
        <input type="radio" value="auto" id="autosize" bind:group={imagemodeselected} /> Auto
      </label>

      <label for="width">
        <input type="radio" value="width" id="width" bind:group={imagemodeselected} /> Width
      </label>

      <label for="height">
        <input type="radio" value="height" id="height" bind:group={imagemodeselected} /> Height
      </label>

      {#if imagemodeselected !== 'auto'}
        <input
          id="height"
          class="input"
          type="number"
          min="3"
          max="10000"
          bind:value={userimagesize} />
      {/if}
    </div>

    <div class="w-full flex gap-2 items-center">
      <input class="input" id="markdown" type="text" value={mdCode} on:click={onCopyMarkdown} />
      <label for="markdown">
        <button class="btn btn-primary btn-md flex-auto" on:click={onCopyMarkdown}>
          Copy Markdown
        </button>
      </label>
    </div>

    <div class="w-full flex gap-2 items-center">
      <input
        class="input"
        id="gist"
        type="text"
        bind:value={gistURL}
        placeholder="Enter Gist URL" />
      <label for="gist">
        <button class="btn btn-primary btn-md flex-auto" on:click={loadGist}> Load Gist </button>
      </label>
    </div>
    {#if isNetlify}
      <div class="w-full flex items-center justify-center">
        <a class="link underline text-gray-500 text-sm" href="https://netlify.com">
          This site is powered by Netlify
        </a>
      </div>
    {/if}
  </div>
</Card>
