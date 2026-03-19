/**
 * Theme registry — diagram themes array with lookup helpers and resolve function.
 */

import { blueprintTheme } from './blueprint';
import { defaultTheme } from './default';
import { glassmorphismTheme } from './glassmorphism';
import type { ColorMode, DiagramTheme, ThemeDefinition } from './types';

/** All diagram themes (3 items — each has light + dark variants) */
export const diagramThemes: DiagramTheme[] = [defaultTheme, glassmorphismTheme, blueprintTheme];

export function getDiagramThemeById(id: string): DiagramTheme {
  return diagramThemes.find((t) => t.id === id) ?? defaultTheme;
}

export function getNextDiagramTheme(currentId: string): DiagramTheme {
  const index = diagramThemes.findIndex((t) => t.id === currentId);
  return diagramThemes[(index + 1) % diagramThemes.length];
}

/** Resolve a DiagramTheme + ColorMode into a flat ThemeDefinition for consumers */
export function resolveTheme(theme: DiagramTheme, mode: ColorMode): ThemeDefinition {
  const variant = theme[mode];
  return {
    canvasBgClass: variant.canvasBgClass,
    colorScheme: mode,
    cssVariables: variant.cssVariables,
    diagramCSS: variant.diagramCSS,
    diagramVariables: variant.diagramVariables,
    id: `${theme.id}-${mode}`,
    layoutConfig: theme.layoutConfig,
    name: `${theme.name} ${mode === 'light' ? 'Light' : 'Dark'}`,
    svgPostProcess: variant.svgPostProcess
  };
}
