import { C } from '$/constants';
import { env } from '$/util/env';
import { editorChooserVariants, type EditorChooserVariant } from '$/util/experiments';

const mermaidAiDomain = 'mermaid.ai';
const mermaidLiveDomain = 'mermaid.live';
const netlifyPreviewDomain = 'netlify.app';

/**
 * Check if we're on mermaid.ai
 */
export const isOnMermaidAI = (): boolean => {
  const domain = window.location.hostname;
  return domain === mermaidAiDomain || domain.endsWith(`.${mermaidAiDomain}`);
};

/**
 * Check if we're on mermaid.live
 */
export const isOnMermaidLive = (): boolean => {
  const domain = window.location.hostname;
  return domain === mermaidLiveDomain || domain.endsWith(`.${mermaidLiveDomain}`);
};

/**
 * Check if we're on a Netlify preview/staging deploy (*.netlify.app).
 */
const isOnNetlifyPreview = (): boolean => {
  return window.location.hostname.endsWith(`.${netlifyPreviewDomain}`);
};

/**
 * Check if the current URL has pako data (diagram content from a shared link).
 */
const hasPakoData = (): boolean => {
  const hash = window.location.hash;
  return (
    hash.includes('pako:') || hash.includes('base64:') || (hash.length > 10 && hash.startsWith('#'))
  );
};

/**
 * Check if the user arrived from a known Mermaid domain (mermaid.ai or mermaid.js.org).
 */
const isReferredFromMermaid = (): boolean => {
  try {
    const referrer = document.referrer;
    if (!referrer) return false;
    const hostname = new URL(referrer).hostname;
    return (
      hostname === 'mermaid.ai' ||
      hostname.endsWith('.mermaid.ai') ||
      hostname === 'mermaid.js.org' ||
      hostname.endsWith('.mermaid.js.org') ||
      hostname === 'mermaid.live' ||
      hostname.endsWith('.mermaid.live')
    );
  } catch {
    return false;
  }
};

/**
 * Check if the editor chooser modal should be shown.
 * Shows for new users who haven't dismissed it and aren't viewing a shared link.
 * Not shown on mobile (viewport width < 640px).
 * Can be forced open for QA via the `?editorChooser=1` query flag, which bypasses
 * the hostname and dismissed checks.
 */
export const shouldShowEditorChooser = (): boolean => {
  if (!env.isEnabledMermaidChartLinks) return false;
  if (window.innerWidth < 640) return false;
  const forced = new URLSearchParams(window.location.search).get('editorChooser') === '1';
  if (forced) return true;
  if (!isOnMermaidAI() && !isOnMermaidLive() && !isOnNetlifyPreview()) return false;
  if (window.localStorage.getItem(C.editorChooserDismissedKey) === 'true') return false;
  if (hasPakoData()) return false;
  if (isReferredFromMermaid()) return false;
  return true;
};

/**
 * Dismiss the editor chooser modal permanently
 */
export const dismissEditorChooser = (): void => {
  window.localStorage.setItem(C.editorChooserDismissedKey, 'true');
};

const isValidVariant = (value: string | null): value is EditorChooserVariant => {
  return value !== null && (editorChooserVariants as readonly string[]).includes(value);
};

/**
 * Get the A/B/C test variant assigned to this user for the editor chooser modal.
 * Assigns a variant on first call (uniform random across variants), persists it
 * in localStorage, and returns the same value on subsequent calls.
 */
export const getEditorChooserVariant = (): EditorChooserVariant => {
  const stored = window.localStorage.getItem(C.editorChooserVariantKey);
  if (isValidVariant(stored)) return stored;
  const variant = editorChooserVariants[Math.floor(Math.random() * editorChooserVariants.length)];
  window.localStorage.setItem(C.editorChooserVariantKey, variant);
  return variant;
};
