import mermaid, { type MermaidConfig } from 'mermaid';
import mindmap from '@mermaid-js/mermaid-mindmap';

const initialize = mermaid.registerExternalDiagrams([mindmap]);

export const init = async () => {
  await initialize;
};

export const render = async (
  config: MermaidConfig,
  code: string,
  id: string,
  callback: Parameters<typeof mermaid.render>[2]
): Promise<void> => {
  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);
  // console.log('Rendering', code);
  // mermaid.mermaidAPI.render(id, code, callback);
  await init();
  await mermaid.mermaidAPI.renderAsync(id, code, callback);
};

export const parse = async (code: string): Promise<boolean> => {
  await init();
  return await mermaid.parseAsync(code);
};
