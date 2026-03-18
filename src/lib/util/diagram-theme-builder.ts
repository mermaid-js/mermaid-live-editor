/**
 * Composes a complete MermaidConfig theme from variables, CSS, and layout configs.
 * Merges silently at render time — not stored in user's config JSON.
 */
import type { MermaidConfig } from 'mermaid';

import { getDarkThemeCSS, getLightThemeCSS } from './diagram-theme-css';
import {
  darkThemeVariables,
  diagramLayoutConfig,
  lightThemeVariables
} from './diagram-theme-variables';

/**
 * Build a full mermaid theme config for the given mode.
 * This is merged with the user's config at render time.
 */
export function buildMermaidThemeConfig(isDark: boolean): MermaidConfig {
  return {
    theme: 'base' as const,
    themeVariables: isDark ? darkThemeVariables : lightThemeVariables,
    themeCSS: isDark ? getDarkThemeCSS() : getLightThemeCSS(),
    ...diagramLayoutConfig
  };
}

/**
 * Detect whether the user's config is in dark mode.
 * Checks the theme property — 'dark' means dark mode.
 */
export function isDarkThemeConfig(config: MermaidConfig): boolean {
  return config.theme === 'dark';
}

/**
 * Deep-merge theme config into user config.
 * User's explicit values take precedence over theme defaults.
 */
export function mergeThemeIntoConfig(userConfig: MermaidConfig): MermaidConfig {
  const isDark = isDarkThemeConfig(userConfig);
  const themeConfig = buildMermaidThemeConfig(isDark);

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
