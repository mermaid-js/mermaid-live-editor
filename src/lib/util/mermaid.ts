import mermaid from 'mermaid';
import type { MermaidConfig, RenderResult } from 'mermaid';
import zenuml from '@mermaid-js/mermaid-zenuml';

try {
  await mermaid.registerExternalDiagrams([zenuml]);
} catch (error) {
  console.error('Error registering external diagrams:', error);
}

export const render = async (
  config: MermaidConfig,
  code: string,
  id: string
): Promise<RenderResult> => {
  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);
  return await mermaid.render(id, code);
};

export const parse = async (code: string): Promise<unknown> => {
  return await mermaid.parse(code);
};
