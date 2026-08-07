/**
 * <mermaid-embed> — a tiny, dependency-free loader for the Mermaid embed widget.
 *
 * Usage:
 *   <script src="https://mermaid.live/embed.js" async></script>
 *   <mermaid-embed src="https://mermaid.live/embed#pako:...">
 *     graph TD
 *       A --> B
 *   </mermaid-embed>
 *
 * The element renders an <iframe> pointing at the host's /embed page. Settings come from the
 * `src` URL and/or attributes (theme, look, mode, grid, pan, zoom, controls). If the element has
 * inline body text, that text is used as the diagram code and OVERRIDES any code in the `src` URL.
 *
 * Authored in TypeScript; `pnpm build:embed` compiles it into `static/embed.js` (IIFE, no
 * imports) so it can be dropped into any page with a single script tag.
 */

// Derive origin + base path from the script URL so base-path deploys work.
const script = document.currentScript;
const scriptUrl = script instanceof HTMLScriptElement && script.src ? new URL(script.src) : null;
const prefix = scriptUrl
  ? scriptUrl.origin + scriptUrl.pathname.replace(/\/embed\.js$/, '')
  : window.location.origin;
const defaultBase = `${prefix}/embed`;

const passthroughAttributes = ['theme', 'look', 'mode', 'grid', 'pan', 'zoom', 'controls'];

const px = (value: string | null, fallback: string): string => {
  if (value === null) {
    return fallback;
  }
  return /^\d+$/.test(value) ? `${value}px` : value;
};

// Strip the common leading indentation from inline HTML so the diagram code is clean.
const dedent = (text: string): string => {
  const lines = text.replaceAll('\t', '  ').split('\n');
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines.at(-1)?.trim() === '') {
    lines.pop();
  }
  let indent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (line.trim() !== '') {
      indent = Math.min(indent, line.length - line.trimStart().length);
    }
  }
  if (!Number.isFinite(indent)) {
    indent = 0;
  }
  return lines.map((line) => line.slice(indent)).join('\n');
};

const buildUrl = (element: HTMLElement): string => {
  const src = element.getAttribute('src') ?? defaultBase;
  const url = new URL(src, window.location.href);

  for (const name of passthroughAttributes) {
    const value = element.getAttribute(name);
    if (value !== null) {
      url.searchParams.set(name, value);
    }
  }

  // Inline body code wins over whatever code the src URL carried.
  const code = dedent(element.textContent ?? '');
  if (code.trim() !== '') {
    url.searchParams.set('code', code);
  }

  return url.toString();
};

const rendered = new WeakSet<HTMLElement>();

const render = (element: HTMLElement): void => {
  if (rendered.has(element)) {
    return;
  }
  rendered.add(element);

  const iframe = document.createElement('iframe');
  iframe.src = buildUrl(element);
  iframe.title = element.getAttribute('title') ?? 'Mermaid diagram';
  iframe.loading = 'lazy';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute(
    'sandbox',
    'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'
  );
  iframe.style.border = '0';
  iframe.style.display = 'block';
  iframe.style.width = px(element.getAttribute('width'), '100%');
  iframe.style.height = px(element.getAttribute('height'), '420px');

  element.style.display = 'block';
  element.textContent = '';
  element.append(iframe);
};

if ('customElements' in window) {
  customElements.define(
    'mermaid-embed',
    class MermaidEmbed extends HTMLElement {
      connectedCallback(): void {
        // Defer a macrotask so any inline text children are fully parsed before we read
        // them (the start tag connects before its text content when scripted upgrade
        // happens mid-parse). setTimeout is more reliable than rAF in headless contexts.
        // render() ignores repeat calls, so re-connects are harmless.
        setTimeout(() => render(this), 0);
      }
    }
  );
}

export {};
