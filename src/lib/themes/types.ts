/**
 * Theme definition interface for the multi-theme system.
 * Each theme is a self-contained object with UI + diagram styling.
 */

export type ColorMode = 'light' | 'dark';

/** Resolved flat theme — consumers read this shape (unchanged API) */
export interface ThemeDefinition {
  /** Unique theme identifier */
  id: string;
  /** Display name for tooltips and menus */
  name: string;
  /** Controls editor theme, .dark class, mode-watcher, Sonner */
  colorScheme: ColorMode;
  /** UI CSS custom properties injected on <html> */
  cssVariables: Record<string, string>;
  /** Mermaid themeVariables for base theme */
  diagramVariables: Record<string, string>;
  /** Mode-specific diagram CSS (shadows, etc.) */
  diagramCSS: string;
  /** SVG post-processor gradient + shadow colors */
  svgPostProcess?: {
    gradientStart: string;
    gradientEnd: string;
    shadowInnerColor?: string;
    shadowOuterColor?: string;
    hollowArrowColor?: string;
  };
  /** Per-theme layout overrides merged on top of global diagramLayoutConfig */
  layoutConfig?: Record<string, Record<string, unknown>>;
  /** Per-theme canvas background class suffix (e.g. 'blueprint' → grid-bg-blueprint) */
  canvasBgClass?: string;
}

/** Variant-specific fields for a single color mode */
export interface ThemeVariant {
  cssVariables: Record<string, string>;
  diagramVariables: Record<string, string>;
  diagramCSS: string;
  svgPostProcess?: ThemeDefinition['svgPostProcess'];
  canvasBgClass?: string;
}

/** A diagram theme with light + dark variants */
export interface DiagramTheme {
  id: string;
  name: string;
  light: ThemeVariant;
  dark: ThemeVariant;
  layoutConfig?: Record<string, Record<string, unknown>>;
}
