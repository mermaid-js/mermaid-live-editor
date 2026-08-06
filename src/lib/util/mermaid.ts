import { diagramData } from '@mermaid-js/examples';
import elkLayouts from '@mermaid-js/layout-elk';
import tidyTreeLayouts from '@mermaid-js/layout-tidy-tree';
import zenuml from '@mermaid-js/mermaid-zenuml';
import type { MermaidConfig, RenderResult } from 'mermaid';
import mermaid from 'mermaid';

mermaid.registerLayoutLoaders([...elkLayouts, ...tidyTreeLayouts]);
const init = mermaid.registerExternalDiagrams([zenuml]);

/**
 * Icon packs for the diagrams that draw icons.
 *
 * mermaid ships no icons beyond architecture's five built-ins: everything
 * else — `logos:aws`, `mdi:database`, an `icon:` on a flowchart node — is
 * resolved against packs the *host* registers, and the Live Editor registers
 * none. Every such icon therefore renders as mermaid's "?" placeholder here,
 * including the ones in the icon documentation's own examples.
 *
 * Fetched from the CDN rather than bundled, exactly as
 * https://mermaid.js.org/config/icons.html describes. A loader runs only when
 * a diagram actually names its pack, so the download happens on the first
 * diagram that uses one and never otherwise. If the fetch fails — offline, or
 * a self-hosted instance with no outbound access — mermaid falls back to the
 * same placeholder shown today, so nothing regresses.
 */
const ICON_PACKS = [
  'logos',
  'simple-icons',
  'mdi',
  'fa6-solid',
  'fa6-brands',
  'carbon',
  'tabler',
  'devicon'
];

mermaid.registerIconPacks(
  ICON_PACKS.map((name) => ({
    name,
    loader: () =>
      fetch(`https://unpkg.com/@iconify-json/${name}@1/icons.json`).then((res) => res.json())
  }))
);

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
