import { defaultState } from '$/constants';
import type { MermaidConfig } from 'mermaid';
import { encodeEmbedParams, type EmbedMode } from './embed';
import { serializeState } from './serde';

/**
 * Options accepted by {@link buildEmbedUrls}.
 * Everything except `code` and `host` is optional and falls back to a sensible default.
 */
export interface EmbedUrlOptions {
  /** The Mermaid diagram source. Required. */
  code: string;
  /** Base mermaid config carried into the hash state (already sanitized by the caller). */
  config?: MermaidConfig;
  /** Show interactive controls (pan/zoom buttons + mode switcher). Default true. */
  controls?: boolean;
  /** Draw the dotted background. Default true. */
  grid?: boolean;
  /** Origin (plus base path) that hosts the widget, e.g. https://mermaid.live. Required. */
  host: string;
  /** Mermaid look: classic | handDrawn | neo. */
  look?: string;
  /** Widget chrome appearance: light | dark (independent of the diagram theme). */
  mode?: EmbedMode;
  /** Mermaid diagram theme, e.g. default | dark | neo | redux-dark. */
  theme?: string;
}

/** Options accepted by {@link buildEmbedCode}: the URL options plus the snippet dimensions. */
export interface EmbedCodeOptions extends EmbedUrlOptions {
  /** iframe / web-component height (CSS value or number). Default '480'. */
  height?: string;
  /** iframe width (CSS value or number). Default '100%'. */
  width?: string;
}

export interface EmbedUrls {
  /** Diagram source, carried through for the web-component body. */
  code: string;
  /** Normalized host (no trailing slash). */
  host: string;
  /** Widget URL with settings only (no hash) — used by the web component. */
  settingsUrl: string;
  /** Canonical embed URL (settings as query params + state in the `#pako:` hash). */
  url: string;
}

export interface EmbedCodeResult {
  /** Ready-to-paste raw <iframe> snippet (code travels in the URL). */
  iframe: string;
  /** Canonical embed URL (settings as query params + state in the `#pako:` hash). */
  url: string;
  /** Ready-to-paste <script> + <mermaid-embed> snippet (code in the element body). */
  webComponent: string;
}

const dimension = (value: string | undefined, fallback: string): string => {
  return value && value.trim() !== '' ? value.trim() : fallback;
};

/** The inline body is parsed back via textContent, which decodes entities. */
const escapeHtml = (text: string): string => {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
};

/** Resolve the embed URLs — the expensive half (state serialization) of {@link buildEmbedCode}. */
export const buildEmbedUrls = (options: EmbedUrlOptions): EmbedUrls => {
  const host = options.host.replace(/\/+$/, '');
  const grid = options.grid !== false;

  // Settings live in the query string (so they override the hash state).
  const qs = encodeEmbedParams({
    controls: options.controls !== false,
    grid,
    look: options.look,
    mode: options.mode,
    theme: options.theme
  });

  const base = `${host}/embed`;
  const settingsUrl = qs ? `${base}?${qs}` : base;

  // Full state for the pako hash (code + config) — used by the raw iframe and
  // keeps the editor "Edit" link faithful.
  const config: MermaidConfig = { ...options.config };
  if (options.theme) {
    config.theme = options.theme as MermaidConfig['theme'];
  }
  if (options.look) {
    config.look = options.look as MermaidConfig['look'];
  }
  const state = {
    ...defaultState,
    code: options.code,
    grid,
    mermaid: JSON.stringify(config)
  };
  const url = `${settingsUrl}#${serializeState(state)}`;

  return { code: options.code, host, settingsUrl, url };
};

/** Format the copyable snippets — the cheap half, safe to re-run per size keystroke. */
export const buildEmbedSnippets = (
  urls: EmbedUrls,
  size: { height?: string; width?: string }
): { iframe: string; webComponent: string } => {
  const width = dimension(size.width, '100%');
  const height = dimension(size.height, '480');

  const iframe =
    `<iframe src="${urls.url}" width="${width}" height="${height}" ` +
    `style="border:0" loading="lazy" title="Mermaid diagram"></iframe>`;

  const widthAttribute = width === '100%' ? '' : ` width="${width}"`;
  const webComponent =
    `<script src="${urls.host}/embed.js" async></script>\n` +
    `<mermaid-embed src="${urls.settingsUrl}"${widthAttribute} height="${height}">\n` +
    `${escapeHtml(urls.code)}\n` +
    `</mermaid-embed>`;

  return { iframe, webComponent };
};

/** Build the embeddable widget code for a diagram. Pure + deterministic. */
export const buildEmbedCode = (options: EmbedCodeOptions): EmbedCodeResult => {
  const urls = buildEmbedUrls(options);
  return { url: urls.url, ...buildEmbedSnippets(urls, options) };
};
