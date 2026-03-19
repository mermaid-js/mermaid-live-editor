/**
 * Theme store — dual persisted stores (colorMode + diagramThemeId),
 * derived activeTheme, and helpers. Migrates from old 'mermaid-theme' key.
 */

import { derived, writable } from 'svelte/store';
import {
  diagramThemes,
  getDiagramThemeById,
  getNextDiagramTheme,
  resolveTheme
} from './theme-registry';
import type { ColorMode, ThemeDefinition } from './types';

const COLOR_MODE_KEY = 'mermaid-color-mode';
const DIAGRAM_THEME_KEY = 'mermaid-diagram-theme';
const OLD_THEME_KEY = 'mermaid-theme';

/** Map old flat theme IDs to new (diagramThemeId, colorMode) pairs */
const MIGRATION_MAP: Record<string, { themeId: string; mode: ColorMode }> = {
  'default-light': { themeId: 'default', mode: 'light' },
  'default-dark': { themeId: 'default', mode: 'dark' },
  glassmorphism: { themeId: 'glassmorphism', mode: 'dark' },
  blueprint: { themeId: 'blueprint', mode: 'dark' }
};

function migrateAndLoad(): { mode: ColorMode; themeId: string } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { mode: 'light', themeId: 'default' };
  }

  const existingMode = localStorage.getItem(COLOR_MODE_KEY) as ColorMode | null;
  const existingTheme = localStorage.getItem(DIAGRAM_THEME_KEY);

  // Already migrated — use new keys
  if (existingMode && existingTheme) {
    return {
      mode: existingMode === 'dark' ? 'dark' : 'light',
      themeId: existingTheme
    };
  }

  // Migrate from old single key
  const oldValue = localStorage.getItem(OLD_THEME_KEY);
  if (oldValue && MIGRATION_MAP[oldValue]) {
    const migrated = MIGRATION_MAP[oldValue];
    localStorage.setItem(COLOR_MODE_KEY, migrated.mode);
    localStorage.setItem(DIAGRAM_THEME_KEY, migrated.themeId);
    localStorage.removeItem(OLD_THEME_KEY);
    return migrated;
  }

  // Fresh install defaults
  return { mode: 'light', themeId: 'default' };
}

const initial = migrateAndLoad();

/** Writable store for color mode (light/dark), persisted */
export const colorMode = writable<ColorMode>(initial.mode);

/** Writable store for diagram theme ID, persisted */
export const diagramThemeId = writable<string>(initial.themeId);

// Persist changes
colorMode.subscribe((mode) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(COLOR_MODE_KEY, mode);
  }
});

diagramThemeId.subscribe((id) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(DIAGRAM_THEME_KEY, id);
  }
});

/** Derived flat ThemeDefinition — same shape as before, consumers need no changes */
export const activeTheme = derived<[typeof colorMode, typeof diagramThemeId], ThemeDefinition>(
  [colorMode, diagramThemeId],
  ([mode, themeId]) => resolveTheme(getDiagramThemeById(themeId), mode)
);

/** Read-only derived active theme ID (backward compat: "default-light", "blueprint-dark", etc.) */
export const activeThemeId = derived(activeTheme, (theme) => theme.id);

/** Exported diagram themes list for UI components */
export { diagramThemes };

/** Toggle between light and dark */
export function toggleColorMode(): void {
  colorMode.update((m) => (m === 'dark' ? 'light' : 'dark'));
}

/** Cycle to the next diagram theme */
export function cycleTheme(): void {
  diagramThemeId.update((currentId) => getNextDiagramTheme(currentId).id);
}
