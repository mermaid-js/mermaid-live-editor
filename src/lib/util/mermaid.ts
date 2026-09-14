import { diagramData } from '@mermaid-js/examples';
import tidyTreeLayouts from '@mermaid-js/layout-tidy-tree';
import zenuml from '@mermaid-js/mermaid-zenuml';
import type { MermaidConfig, RenderResult } from 'mermaid';
import mermaid from 'mermaid';

// ELK ships bundled with mermaid 12 and is registered automatically.
mermaid.registerLayoutLoaders(tidyTreeLayouts);
const init = mermaid.registerExternalDiagrams([zenuml]);

export const render = async (
  config: MermaidConfig,
  code: string,
  id: string
): Promise<RenderResult> => {
  await init;

  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);
  return await mermaid.render(id, code);
};

export const parse = async (code: string) => {
  return await mermaid.parse(code);
};

/**
 * @see https://mermaid.js.org/config/schema-docs/config.html
 */
export const defaultMermaidConfig = mermaid.mermaidAPI.defaultConfig ?? {};

// Detector ids (what `mermaid.parse` reports as diagramType) whose config
// section is named differently. Every other id shares its section's name, and
// ids without a section at all (wardley, zenuml) use the global defaults.
const CONFIG_SECTION_ALIASES: Record<string, string> = {
  classDiagram: 'class',
  'flowchart-elk': 'flowchart',
  'flowchart-v2': 'flowchart',
  railroadAbnf: 'railroad',
  railroadEbnf: 'railroad',
  railroadPeg: 'railroad',
  stateDiagram: 'state',
  xychart: 'xyChart'
};

const themeOfSection = (section: unknown): string | undefined => {
  if (section && typeof section === 'object' && 'theme' in section) {
    const { theme } = section as { theme?: unknown };
    if (typeof theme === 'string') {
      return theme;
    }
  }
  return undefined;
};

const globalDefaultTheme: string = defaultMermaidConfig.theme ?? 'default';

/** Mermaid's own default theme for a diagram type: its config section's, else the global one. */
export const getDefaultTheme = (diagramType: string): string => {
  const key = CONFIG_SECTION_ALIASES[diagramType] ?? diagramType;
  const section = (defaultMermaidConfig as Record<string, unknown>)[key];
  return themeOfSection(section) ?? globalDefaultTheme;
};

/** Dark counterpart of a default theme: redux themes have -dark variants, anything else uses `dark`. */
export const darkVariantOf = (theme: string): string => {
  if (theme.includes('dark')) {
    return theme;
  }
  return theme.startsWith('redux') ? theme.replace('redux', 'redux-dark') : 'dark';
};

// Every theme the editor may set on its own: the global default, each config
// section's default and their dark variants. Anything else is the user's choice.
const managedThemes = new Set<string>();
for (const theme of [
  globalDefaultTheme,
  ...Object.values(defaultMermaidConfig).map(themeOfSection)
]) {
  if (theme) {
    managedThemes.add(theme);
    managedThemes.add(darkVariantOf(theme));
  }
}

/** Whether the editor may replace this theme (a missing theme counts as managed). */
export const isManagedTheme = (theme: unknown): boolean =>
  theme === undefined || (typeof theme === 'string' && managedThemes.has(theme));

export const standardizeDiagramType = (diagramType: string) => {
  switch (diagramType) {
    case 'class':
    case 'classDiagram': {
      return 'classDiagram';
    }
    case 'graph':
    case 'flowchart':
    case 'flowchart-elk':
    case 'flowchart-v2': {
      return 'flowchart';
    }
    default: {
      return diagramType;
    }
  }
};

type DiagramDefinition = (typeof diagramData)[number];

export type SampleExample = DiagramDefinition['examples'][number];

const isValidDiagram = (diagram: DiagramDefinition): diagram is Required<DiagramDefinition> => {
  return Boolean(diagram.name && diagram.examples && diagram.examples.length > 0);
};

export const getSampleDiagrams = (): Record<string, SampleExample[]> => {
  const samples: Record<string, SampleExample[]> = {};
  for (const diagram of diagramData.filter((d) => isValidDiagram(d))) {
    // The default example comes first, so it is loaded when clicking the
    // diagram name and shown at the top of the example dropdown.
    samples[diagram.name.replace(/ (Diagram|Chart|Graph)/, '')] = [...diagram.examples].sort(
      (a, b) => Number(b.isDefault ?? false) - Number(a.isDefault ?? false)
    );
  }
  return samples;
};
