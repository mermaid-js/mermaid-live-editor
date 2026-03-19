/**
 * Composes a complete MermaidConfig theme from the active theme definition.
 * Merges silently at render time — not stored in user's config JSON.
 */
import type { MermaidConfig } from 'mermaid';
import { get } from 'svelte/store';

import { activeTheme } from '$lib/themes/theme-store';
import type { ThemeDefinition } from '$lib/themes/types';
import { diagramLayoutConfig } from '$lib/themes/diagram-layout-config';

/**
 * Build a full mermaid theme config from a ThemeDefinition.
 */
export function buildMermaidThemeConfig(theme: ThemeDefinition): MermaidConfig {
  // Start with global layout config, then apply per-theme overrides
  const layout: Record<string, Record<string, unknown>> = { ...diagramLayoutConfig };
  if (theme.layoutConfig) {
    for (const [key, overrides] of Object.entries(theme.layoutConfig)) {
      if (key in layout) {
        layout[key] = { ...layout[key], ...overrides };
      } else {
        layout[key] = overrides;
      }
    }
  }

  return {
    theme: 'base' as const,
    themeVariables: theme.diagramVariables,
    themeCSS: theme.diagramCSS,
    ...layout
  };
}

/**
 * Deep-merge theme config into user config.
 * Reads the active theme from the store.
 * User's explicit values take precedence over theme defaults.
 */
export function mergeThemeIntoConfig(userConfig: MermaidConfig): MermaidConfig {
  const theme = get(activeTheme);
  const themeConfig = buildMermaidThemeConfig(theme);

  return {
    // Theme layout configs as base
    ...themeConfig,
    // User config overrides
    ...userConfig,
    // Always use base theme for custom styling
    theme: 'base' as const,
    // Theme CSS — append user's themeCSS after ours
    themeCSS: (themeConfig.themeCSS ?? '') + '\n' + (userConfig.themeCSS ?? ''),
    // Merge themeVariables — user overrides win
    themeVariables: {
      ...themeConfig.themeVariables,
      ...(userConfig.themeVariables ?? {})
    }
  };
}
