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
 * inline body text, that text is used as the diagram code and OVERRIDES any code in the `src` URL
 * (carried in the `#code:` hash — not the query string).
 *
 * Authored in TypeScript; `pnpm build:embed` compiles it into `static/embed.js` (IIFE, no
 * imports) so it can be dropped into any page with a single script tag.
 */

/**
 * Keep in sync with `EMBED_IFRAME_SANDBOX` in `$/util/embedCode`.
 * `allow-same-origin` is required for the SvelteKit `/embed` app to boot; see embedCode.ts.
 */
const IFRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';

/**
 * Resolve the loader script URL. `document.currentScript` is null for async/defer scripts,
 * so fall back to scanning for a script whose path ends in `/embed.js`.
 */
const resolveScriptUrl = (): URL | null => {
  if (document.currentScript instanceof HTMLScriptElement && document.currentScript.src) {
    return new URL(document.currentScript.src);
  }
  for (const element of document.querySelectorAll('script[src]')) {
    if (!(element instanceof HTMLScriptElement)) {
      continue;
    }
    try {
      const url = new URL(element.src, window.location.href);
      if (/\/embed\.js$/i.test(url.pathname)) {
        return url;
      }
    } catch {
      // ignore invalid script URLs
    }
  }
  return null;
};

const scriptUrl = resolveScriptUrl();
const prefix = scriptUrl
  ? scriptUrl.origin + scriptUrl.pathname.replace(/\/embed\.js$/i, '')
  : null;
const defaultBase = prefix ? `${prefix}/embed` : null;
const allowedOrigin = scriptUrl?.origin;

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

const buildUrl = (element: HTMLElement): string | undefined => {
  const srcAttribute = element.getAttribute('src');
  if (!srcAttribute && !defaultBase) {
    console.error(
      'mermaid-embed: missing src and could not derive host from embed.js (async scripts need an absolute src)'
    );
    return undefined;
  }

  const src = srcAttribute ?? defaultBase;
  if (!src) {
    return undefined;
  }

  let url: URL;
  try {
    url = new URL(src, window.location.href);
  } catch {
    console.error('mermaid-embed: invalid src');
    return undefined;
  }

  if (allowedOrigin && url.origin !== allowedOrigin) {
    console.error(
      `mermaid-embed: src origin must match embed.js host (${allowedOrigin}), got ${url.origin}`
    );
    return undefined;
  }

  for (const name of passthroughAttributes) {
    const value = element.getAttribute(name);
    if (value !== null) {
      url.searchParams.set(name, value);
    }
  }

  // Inline body code wins over whatever code the src URL carried. Put it in the
  // hash (`#code:…`) so it stays out of query strings / server logs / Referer.
  const code = dedent(element.textContent ?? '');
  if (code.trim() !== '') {
    url.hash = `code:${encodeURIComponent(code)}`;
  }

  return url.toString();
};

const rendered = new WeakSet<HTMLElement>();

const render = (element: HTMLElement): void => {
  if (rendered.has(element)) {
    return;
  }

  const src = buildUrl(element);
  if (!src) {
    return;
  }
  rendered.add(element);

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = element.getAttribute('title') ?? 'Mermaid diagram';
  iframe.loading = 'lazy';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('sandbox', IFRAME_SANDBOX);
  iframe.style.border = '0';
  iframe.style.display = 'block';
  iframe.style.width = px(element.getAttribute('width'), '100%');
  iframe.style.height = px(element.getAttribute('height'), '480px');

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
