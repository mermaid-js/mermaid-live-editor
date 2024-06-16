import mermaid from 'mermaid';
import type { MermaidConfig, RenderResult } from 'mermaid';
import zenuml from '@mermaid-js/mermaid-zenuml';

const init = mermaid.registerExternalDiagrams([zenuml]);

export const render = async (
  config: MermaidConfig,
  code: string,
  id: string
): Promise<RenderResult> => {
  await init;

  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);

  try {
    const result = await mermaid.render(id, code);
    return result;
  } catch {
    const errorDiv = document.querySelector(`#d${id}`);
    const svg = errorDiv?.innerHTML ?? '';
    errorDiv?.remove();
    return {
      svg,
      bindFunctions: undefined
    };
  }
};

export const parse = async (code: string): Promise<unknown> => {
  return await mermaid.parse(code);
};
