import elkLayouts from '@mermaid-js/layout-elk';
import zenuml from '@mermaid-js/mermaid-zenuml';
import type { RenderResult } from 'mermaid';
import mermaid from 'mermaid';
import type { MermaidConfig } from 'mermaid';
import type { IconLoader } from 'mermaid/dist/rendering-util/icons.js';

export interface ExtendedMermaidConfig extends MermaidConfig {
  liveEditor?: {
    icons?: {
      [key: string]: string;
    };
  };
}

mermaid.registerLayoutLoaders(elkLayouts);
const init = mermaid.registerExternalDiagrams([zenuml]);

function getIconLoader(name: string, packageNameOrUrl: string): IconLoader {
  const url = packageNameOrUrl.startsWith('https')
    ? packageNameOrUrl
    : `https://cdn.jsdelivr.net/npm/${packageNameOrUrl}/icons.json`;
  return {
    name: name,
    loader: () => fetch(url).then((res) => res.json())
  };
}

function mermaidRegisterProcess(config: ExtendedMermaidConfig) {
  const iconPacks: IconLoader[] = [];
  for (const [name, packageName] of Object.entries(config.liveEditor?.icons ?? {})) {
    const iconPack = getIconLoader(name, packageName);
    iconPacks.push(iconPack);
  }
  if (iconPacks.length > 0) {
    mermaid.registerIconPacks(iconPacks);
  }
}

export const render = async (
  config: ExtendedMermaidConfig,
  code: string,
  id: string
): Promise<RenderResult> => {
  await init;

  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);
  mermaidRegisterProcess(config);
  return await mermaid.render(id, code);
};

export const parse = async (code: string) => {
  return await mermaid.parse(code);
};

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
