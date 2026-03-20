import { browser } from '$app/environment';
import { waitForRender } from '$lib/util/autoSync';
import { inputStateStore, stateStore, updateCodeStore } from '$lib/util/state';
import { get } from 'svelte/store';
import { version as FAVersion } from '@fortawesome/fontawesome-free/package.json';
import dayjs from 'dayjs';
import { toBase64 } from 'js-base64';

const FONT_AWESOME_URL = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/${FAVersion}/css/all.min.css`;

export type ImageSizeMode = 'auto' | 'width' | 'height';
export type DownloadFormat = 'svg' | 'animated-svg' | 'png' | 'jpeg' | 'webp';

export interface DownloadOptions {
  imageSize: number;
  imageSizeMode: ImageSizeMode;
}

const mimeTypes: Record<Exclude<DownloadFormat, 'svg' | 'animated-svg'>, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
};

const extensions: Record<DownloadFormat, string> = {
  'animated-svg': 'svg',
  jpeg: 'jpg',
  png: 'png',
  svg: 'svg',
  webp: 'webp'
};

const getFileName = (format: DownloadFormat) =>
  format === 'animated-svg'
    ? `mermaid-diagram-${dayjs().format('YYYY-MM-DD-HHmmss')}-animated.${extensions[format]}`
    : `mermaid-diagram-${dayjs().format('YYYY-MM-DD-HHmmss')}.${extensions[format]}`;

const simulateDownload = (download: string, href: string): void => {
  const a = document.createElement('a');
  a.download = download;
  a.href = href;
  a.click();
  a.remove();
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

const getAnimatedSVG = (): string => {
  const svg = getSvgElement();
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  const background = window.getComputedStyle(document.body).getPropertyValue('--background').trim();
  svg.style.backgroundColor = background;

  const width = svg.viewBox?.baseVal?.width || svg.getBoundingClientRect().width || 0;
  const height = svg.viewBox?.baseVal?.height || svg.getBoundingClientRect().height || 0;

  if (
    width > 0 &&
    height > 0 &&
    !svg.querySelector(':scope > rect[data-animated-svg-background="true"]')
  ) {
    const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    backgroundRect.setAttribute('data-animated-svg-background', 'true');
    backgroundRect.setAttribute('x', '0');
    backgroundRect.setAttribute('y', '0');
    backgroundRect.setAttribute('width', `${width}`);
    backgroundRect.setAttribute('height', `${height}`);
    backgroundRect.setAttribute('fill', background);
    svg.insertBefore(backgroundRect, svg.firstChild);
  }

  const revealElements = Array.from(svg.querySelectorAll<SVGElement>('[id]')).filter((element) => {
    const tagName = element.tagName.toLowerCase();
    const id = element.id || '';
    if (!id) return false;
    if (
      [
        'svg',
        'defs',
        'style',
        'marker',
        'clipPath',
        'linearGradient',
        'radialGradient',
        'filter'
      ].includes(tagName)
    ) {
      return false;
    }
    if (
      id.startsWith('marker') ||
      id.startsWith('clipPath') ||
      id.startsWith('filter') ||
      id.startsWith('gradient')
    ) {
      return false;
    }
    return true;
  });

  const stepDuration = 140;
  const finalPause = 400;
  const rules = revealElements.map((element, index) => {
    element.classList.add('animated-svg-step');
    return `[id="${cssEscape(element.id)}"]{animation-delay:${index * stepDuration}ms;}`;
  });
  const totalDuration = revealElements.length * stepDuration + finalPause;

  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    @keyframes mermaidFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animated-svg-step {
      opacity: 0;
      animation-name: mermaidFadeIn;
      animation-duration: 220ms;
      animation-fill-mode: forwards;
      animation-timing-function: ease-out;
    }
    ${rules.join('\n')}
    svg {
      animation: mermaidReplay ${totalDuration}ms linear infinite;
    }
    @keyframes mermaidReplay {
      from { }
      to { }
    }
  `;
  svg.appendChild(style);

  return `<?xml version="1.0" encoding="UTF-8"?>\n${svg.outerHTML}`;
};

const cssEscape = (value: string): string => value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');

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
    return true;
  }

  if (format === 'svg' || format === 'animated-svg') {
    return true;
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
  if (format === 'svg') {
    simulateDownload(getFileName(format), `data:image/svg+xml;base64,${getBase64SVG()}`);
    return;
  }

  if (format === 'animated-svg') {
    simulateDownload(
      getFileName(format),
      `data:image/svg+xml;base64,${toBase64(getAnimatedSVG())}`
    );
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
