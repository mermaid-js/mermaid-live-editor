import { C, defaultState } from '$/constants';
import type { State } from '$/types';
import type { MermaidConfig } from 'mermaid';
import { MCBaseURL } from './env';
import { isOnMermaidAI } from './migration/domainMigration';
import { silentlySanitizeConfig } from './sanitize';
import { deserializeState, serializeState } from './serde';

/** Widget chrome appearance — the independent axis from the diagram theme/look. */
export type EmbedMode = 'dark' | 'light';

export interface EmbedSettings {
  code: string;
  /** Mermaid config actually rendered (includes `theme` + `look`, sanitized, securityLevel strict). */
  config: MermaidConfig;
  /** Whether interactive controls (pan/zoom buttons + mode switcher) are shown. */
  controls: boolean;
  /** Whether the dotted background is drawn. */
  grid: boolean;
  /** Mermaid `look`: classic | handDrawn | neo. */
  look: string;
  /** Widget chrome appearance (light/dark page), independent of the diagram theme. */
  mode: EmbedMode;
  pan?: { x: number; y: number };
  /** Hand-drawn (Svg2Roughjs) rendering, from the hash state. */
  rough: boolean;
  /** Mermaid diagram theme, e.g. default | dark | neo | redux-dark. */
  theme: string;
  zoom?: number;
}

export interface ResolvedEmbed {
  error?: string;
  settings?: EmbedSettings;
}

/** A diagram theme is "dark" if its name contains "dark" (dark, redux-dark, neo-dark, …). */
export const isDarkTheme = (theme: string): boolean => /dark/i.test(theme);

/** Widget settings that travel in the query string. Decoded by {@link resolveEmbedSettings}. */
export interface EmbedParams {
  controls?: boolean;
  grid?: boolean;
  look?: string;
  mode?: EmbedMode;
  theme?: string;
}

/** Encode settings as query params (only non-defaults) — the inverse of {@link resolveEmbedSettings}. */
export const encodeEmbedParams = ({ controls, grid, look, mode, theme }: EmbedParams): string => {
  const query = new URLSearchParams();
  if (theme) {
    query.set('theme', theme);
  }
  if (look) {
    query.set('look', look);
  }
  if (mode) {
    query.set('mode', mode);
  }
  if (controls === false) {
    query.set('controls', '0');
  }
  if (grid === false) {
    query.set('grid', '0');
  }
  return query.toString();
};

const parsePan = (value: string | null): { x: number; y: number } | undefined => {
  if (!value) {
    return undefined;
  }
  const [x, y] = value.split(',').map(Number);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : undefined;
};

/**
 * Resolve the widget settings from an embed URL.
 *
 * Precedence (highest first): `?code=` > `#code:` (web component body) >
 * hash `#pako:`/`#base64:` state > defaults.
 *
 * Unlike the editor's state loading this never asks the user anything: unsafe
 * config is silently stripped and `securityLevel` is forced to `strict`.
 */
export const resolveEmbedSettings = (url: URL): ResolvedEmbed => {
  const q = url.searchParams;

  // Base state / raw code from the hash, if any.
  const hash = url.hash.replace(/^#/, '');
  let baseState: State | undefined;
  let hashCode: string | undefined;
  let hashFailed = false;
  if (hash.startsWith('code:')) {
    try {
      hashCode = decodeURIComponent(hash.slice('code:'.length));
    } catch {
      hashFailed = true;
    }
  } else if (hash) {
    try {
      baseState = deserializeState(hash);
    } catch {
      hashFailed = true;
    }
  }

  const queryCode = q.get('code');
  if (hashFailed && !queryCode) {
    return { error: 'Unable to load the diagram from this URL.' };
  }

  const code = queryCode ?? hashCode ?? (baseState?.code || defaultState.code);

  const config: MermaidConfig = {
    ...silentlySanitizeConfig(baseState?.mermaid),
    ...silentlySanitizeConfig(q.get('config') ?? undefined)
  };

  // Diagram theme + look (Mermaid config). Query overrides hash state; then defaults.
  const theme = q.get('theme') ?? (config.theme as string | undefined) ?? 'default';
  const look = q.get('look') ?? (config.look as string | undefined) ?? 'classic';
  config.theme = theme as MermaidConfig['theme'];
  config.look = look as MermaidConfig['look'];
  config.securityLevel = 'strict';

  // Chrome appearance (independent). Explicit ?mode= wins; otherwise follow the theme's darkness.
  const modeParam = q.get('mode');
  const mode: EmbedMode =
    modeParam === 'dark' || modeParam === 'light'
      ? modeParam
      : isDarkTheme(theme)
        ? 'dark'
        : 'light';

  const controls = q.get('controls') !== '0';
  const grid = q.get('grid') !== '0' && baseState?.grid !== false;
  const rough = baseState?.rough ?? false;

  const pan = parsePan(q.get('pan')) ?? baseState?.pan;
  const zoomParam = q.get('zoom');
  const zoom =
    zoomParam !== null && Number.isFinite(Number(zoomParam)) ? Number(zoomParam) : baseState?.zoom;

  return { settings: { code, config, controls, grid, look, mode, pan, rough, theme, zoom } };
};

/** Toggle the widget chrome appearance (does not touch the diagram theme — independent axis). */
export const toggleMode = (settings: EmbedSettings): EmbedSettings => {
  return { ...settings, mode: settings.mode === 'dark' ? 'light' : 'dark' };
};

/** Build a shareable State from the current settings (for the footer links). */
const buildEditState = (settings: EmbedSettings): State => {
  return {
    ...defaultState,
    code: settings.code,
    grid: settings.grid,
    mermaid: JSON.stringify(settings.config, undefined, 2),
    pan: settings.pan,
    rough: settings.rough,
    zoom: settings.zoom
  };
};

/** Serialize the resolved settings as editor-hash state, shared by the footer links. */
export const serializeEmbedState = (settings: EmbedSettings): string => {
  return serializeState(buildEditState(settings));
};

/** "Edit" link → this site's own editor, carrying the state in the hash. */
export const buildEditUrl = (serialized: string, editBase: string): string => {
  return `${editBase}#${serialized}`;
};

/** "Save in Mermaid Chart" link → mermaid.ai, carrying the serialized state. */
export const buildSaveUrl = (serialized: string): string => {
  const utmSource = isOnMermaidAI() ? C.aiLiveEditor : C.utmSource;
  return `${MCBaseURL}/app/plugin/save?state=${encodeURIComponent(serialized)}&utm_source=${utmSource}&utm_medium=embed`;
};
