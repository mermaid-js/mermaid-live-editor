import { C } from '$/constants';
import { env } from '$/util/env';

const mermaidAiDomain = 'mermaid.ai';
const mermaidLiveDomain = 'mermaid.live';

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
      hostname.endsWith('.mermaid.js.org')
    );
  } catch {
    return false;
  }
};

/**
 * Check if the editor chooser modal should be shown.
 * Shows for new users who haven't dismissed it and aren't viewing a shared link.
 * Not shown on mobile (viewport width < 640px).
 */
export const shouldShowEditorChooser = (): boolean => {
  if (!env.isEnabledMermaidChartLinks) return false;
  if (!isOnMermaidAI() && !isOnMermaidLive()) return false;
  if (window.innerWidth < 640) return false;
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
