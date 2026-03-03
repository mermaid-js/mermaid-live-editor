import { C } from '$/constants';
import { env } from '$/util/env';

const mermaidAiDomain = 'mermaid.ai';

/**
 * Check if we're on mermaid.ai
 */
export const isOnMermaidAI = (): boolean => {
  const domain = window.location.hostname;
  return domain === mermaidAiDomain || domain.endsWith(`.${mermaidAiDomain}`);
};

// localStorage keys that indicate a returning user.
// Note: codeStore is excluded because it's always populated with the default state on first load.
const userDataStorageKeys = [
  'manualHistoryStore', // Manual history entries
  'autoHistoryStore' // Auto history entries
];

/**
 * Check if user has any stored data in localStorage.
 * This includes saved diagrams, history entries, etc.
 */
const hasStoredUserData = (): boolean => {
  for (const key of userDataStorageKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value !== '[]' && value !== 'null' && value !== '{}') {
      return true;
    }
  }
  return false;
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
 * Check if the editor chooser modal should be shown.
 * Shows for new users who haven't dismissed it and aren't viewing a shared link.
 */
export const shouldShowEditorChooser = (): boolean => {
  if (!env.isEnabledMermaidChartLinks) return false;
  if (window.localStorage.getItem(C.editorChooserDismissedKey) === 'true') return false;
  if (hasStoredUserData()) return false;
  if (hasPakoData()) return false;
  return true;
};

/**
 * Dismiss the editor chooser modal permanently
 */
export const dismissEditorChooser = (): void => {
  window.localStorage.setItem(C.editorChooserDismissedKey, 'true');
};
