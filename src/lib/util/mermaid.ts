import { diagramData } from '@mermaid-js/examples';
import elkLayouts from '@mermaid-js/layout-elk';
import tidyTreeLayouts from '@mermaid-js/layout-tidy-tree';
import zenuml from '@mermaid-js/mermaid-zenuml';
import type { MermaidConfig, RenderResult } from 'mermaid';
import mermaid from 'mermaid';

mermaid.registerLayoutLoaders([...elkLayouts, ...tidyTreeLayouts]);
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
