import { browser } from '$app/environment';
import { beautyServiceEndpoints } from '$lib/util/beauty-service';
import { waitForRender } from '$lib/util/autoSync';
import { env } from '$lib/util/env';
import { inputStateStore, stateStore, updateCodeStore } from '$lib/util/state';
import { get } from 'svelte/store';
import { version as FAVersion } from '@fortawesome/fontawesome-free/package.json';
import dayjs from 'dayjs';
import { toBase64 } from 'js-base64';

const FONT_AWESOME_URL = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/${FAVersion}/css/all.min.css`;

export type ImageSizeMode = 'auto' | 'width' | 'height';
export type DownloadFormat = 'svg' | 'png' | 'jpeg' | 'webp' | 'gif';

export interface DownloadOptions {
  imageSize: number;
  imageSizeMode: ImageSizeMode;
}

export class GifExportError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'GifExportError';
    this.code = code;
  }
}

const mimeTypes: Record<Exclude<DownloadFormat, 'svg'>, string> = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
};

const extensions: Record<DownloadFormat, string> = {
  gif: 'gif',
  jpeg: 'jpg',
  png: 'png',
  svg: 'svg',
  webp: 'webp'
};

const getFileName = (format: DownloadFormat) =>
  `mermaid-diagram-${dayjs().format('YYYY-MM-DD-HHmmss')}.${extensions[format]}`;

const simulateDownload = (download: string, href: string): void => {
  const a = document.createElement('a');
  a.download = download;
  a.href = href;
  a.click();
  a.remove();
};

const simulateBlobDownload = (download: string, blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  simulateDownload(download, url);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const getSvgElement = (): HTMLElement => {
  const svgElement = document.querySelector('#container svg')?.cloneNode(true) as
    | HTMLElement
    | undefined;
  if (!svgElement) {
    throw new Error('svg not found');
  }
  svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  return svgElement;
};

const getRenderPayload = (options: DownloadOptions) => {
  const svg = document.querySelector<SVGSVGElement>('#container svg');
  const box = svg?.getBoundingClientRect();
  const viewBox = svg?.viewBox?.baseVal;
  const width =
    viewBox && viewBox.width > 0 ? Math.round(viewBox.width) : Math.round(box?.width ?? 0);
  const height =
    viewBox && viewBox.height > 0 ? Math.round(viewBox.height) : Math.round(box?.height ?? 0);

  let resolvedWidth = 0;
  let resolvedHeight = 0;

  if (options.imageSizeMode === 'width') {
    resolvedWidth = options.imageSize;
  } else if (options.imageSizeMode === 'height') {
    resolvedHeight = options.imageSize;
  } else {
    resolvedWidth = width;
    resolvedHeight = height;
  }

  let theme = '';
  try {
    const parsed = JSON.parse(get(stateStore).mermaid) as { theme?: string };
    theme = parsed.theme ?? '';
  } catch {
    // Ignore invalid config here; the editor already surfaces config errors.
  }

  return {
    background: window.getComputedStyle(document.body).getPropertyValue('--background').trim(),
    code: get(inputStateStore).code,
    height: resolvedHeight,
    scale: options.imageSizeMode === 'auto' ? 2 : 0,
    theme,
    width: resolvedWidth
  };
};

const downloadGifDiagram = async (options: DownloadOptions): Promise<void> => {
  if (!env.beautyServiceUrl) {
    throw new GifExportError('service_not_configured', 'GIF export service is not configured');
  }

  const response = await fetch(beautyServiceEndpoints.gifRender(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(getRenderPayload(options))
  });

  if (!response.ok) {
    let message = 'GIF export failed';
    let code = 'gif_export_failed';
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      code = payload.error ?? code;
      message = payload.message ?? message;
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new GifExportError(code, message);
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new GifExportError('empty_gif', 'GIF export returned an empty file');
  }

  simulateBlobDownload(getFileName('gif'), blob);
};

/**
 * Fix text clipping in exported SVG for hand-drawn (rough) mode.
 * svg2roughjs copies foreignObject elements but their height is often insufficient,
 * causing text bottom edges to be cut off regardless of language.
 */
const fixForeignObjectClipping = (svg: HTMLElement) => {
  const foreignObjects = svg.querySelectorAll('foreignObject');
  foreignObjects.forEach((foreignObj) => {
    const currentHeight = parseFloat(foreignObj.getAttribute('height') || '0');
    if (currentHeight <= 0) return;

    const currentY = parseFloat(foreignObj.getAttribute('y') || '0');
    const newHeight = currentHeight * 1.5;
    const heightDiff = newHeight - currentHeight;

    foreignObj.setAttribute('height', newHeight.toString());
    foreignObj.setAttribute('y', (currentY - heightDiff / 2).toString());

    const htmlElements = foreignObj.querySelectorAll('div, span, p');
    htmlElements.forEach((htmlEl) => {
      const el = htmlEl as HTMLElement;
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.height = '100%';
    });
  });
};

export const getBase64SVG = (svg?: HTMLElement, width?: number, height?: number): string => {
  if (svg) {
    svg = svg.cloneNode(true) as HTMLElement;
  }

  if (height) {
    svg?.setAttribute('height', `${height}px`);
  }
  if (width) {
    svg?.setAttribute('width', `${width}px`);
  }

  if (!svg) {
    svg = getSvgElement();
  }

  if (get(stateStore).rough) {
    fixForeignObjectClipping(svg);
  }

  svg.style.backgroundColor = window
    .getComputedStyle(document.body)
    .getPropertyValue('--background');

  const svgString = svg.outerHTML
    .replaceAll('<br>', '<br/>')
    .replaceAll(/<img([^>]*)>/g, (m, g: string) => `<img ${g} />`);

  return toBase64(`<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="${FONT_AWESOME_URL}" type="text/css"?>
${svgString}`);
};

const renderToCanvas = async ({
  imageSize,
  imageSizeMode
}: DownloadOptions): Promise<HTMLCanvasElement> => {
  const originalPanZoom = get(inputStateStore).panZoom;
  updateCodeStore({ panZoom: false });

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await waitForRender();

    const canvas = document.createElement('canvas');
    const svg = document.querySelector<HTMLElement>('#container svg');
    if (!svg) {
      throw new Error('svg not found');
    }

    const box = svg.getBoundingClientRect();
    const svgEl = svg as unknown as SVGSVGElement;
    const viewBox = svgEl.viewBox?.baseVal;
    const contentWidth = viewBox && viewBox.width > 0 ? viewBox.width : box.width;
    const contentHeight = viewBox && viewBox.height > 0 ? viewBox.height : box.height;

    if (imageSizeMode === 'width') {
      const ratio = contentHeight / contentWidth;
      canvas.width = imageSize;
      canvas.height = imageSize * ratio;
    } else if (imageSizeMode === 'height') {
      const ratio = contentWidth / contentHeight;
      canvas.width = imageSize * ratio;
      canvas.height = imageSize;
    } else {
      const multiplier = 2;
      canvas.width = contentWidth * multiplier;
      canvas.height = contentHeight * multiplier;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('context not found');
    }

    context.fillStyle = window.getComputedStyle(document.body).getPropertyValue('--background');
    context.fillRect(0, 0, canvas.width, canvas.height);

    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('image load timeout')), 5000);

      image.addEventListener('load', () => {
        window.clearTimeout(timeout);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve();
      });

      image.addEventListener('error', () => {
        window.clearTimeout(timeout);
        reject(new Error('failed to load exported svg into canvas'));
      });

      image.src = `data:image/svg+xml;base64,${getBase64SVG(svg, canvas.width, canvas.height)}`;
    });

    return canvas;
  } finally {
    updateCodeStore({ panZoom: originalPanZoom });
  }
};

export const isDownloadFormatSupported = (format: DownloadFormat): boolean => {
  if (!browser) {
    return format !== 'gif';
  }

  if (format === 'svg') {
    return true;
  }

  if (format === 'gif') {
    return !!env.beautyServiceUrl;
  }

  const canvas = document.createElement('canvas');
  return canvas.toDataURL(mimeTypes[format]).startsWith(`data:${mimeTypes[format]}`);
};

export const copyDiagramToClipboard = async (options: DownloadOptions): Promise<void> => {
  if (!Object.prototype.hasOwnProperty.call(window, 'ClipboardItem')) {
    throw new Error('clipboard not available');
  }

  const canvas = await renderToCanvas(options);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (!value) {
        reject(new Error('blob is empty'));
        return;
      }
      resolve(value);
    }, 'image/png');
  });

  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob
    })
  ]);
};

export const downloadDiagram = async (
  format: DownloadFormat,
  options: DownloadOptions
): Promise<void> => {
  if (format === 'gif') {
    await downloadGifDiagram(options);
    return;
  }

  if (format === 'svg') {
    simulateDownload(getFileName(format), `data:image/svg+xml;base64,${getBase64SVG()}`);
    return;
  }

  if (!isDownloadFormatSupported(format)) {
    throw new Error(`${format} export is not supported in this browser`);
  }

  const canvas = await renderToCanvas(options);
  const mimeType = mimeTypes[format];
  const quality = format === 'jpeg' || format === 'webp' ? 0.92 : undefined;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  if (!dataUrl.startsWith(`data:${mimeType}`)) {
    throw new Error(`${format} export could not be generated`);
  }

  simulateDownload(getFileName(format), dataUrl);
};
