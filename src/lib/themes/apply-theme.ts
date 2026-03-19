/**
 * Applies a ThemeDefinition at runtime — injects CSS vars on <html>,
 * toggles .dark class, and syncs mode-watcher.
 */

import { setMode } from 'mode-watcher';
import type { ThemeDefinition } from './types';

/** Apply theme CSS variables to the document and sync dark/light state */
export function applyTheme(theme: ThemeDefinition): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Inject all CSS custom properties on <html>
  for (const [prop, value] of Object.entries(theme.cssVariables)) {
    root.style.setProperty(prop, value);
  }

  // Toggle .dark class for Tailwind dark: variant
  if (theme.colorScheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Sync mode-watcher so components reading $mode stay consistent
  setMode(theme.colorScheme);
}
