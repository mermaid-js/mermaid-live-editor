import mermaid, { type MermaidConfig } from 'mermaid';

export const render = async (
  config: MermaidConfig,
  code: string,
  id: string,
  callback: Parameters<typeof mermaid.render>[2]
): Promise<void> => {
  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);
  await mermaid.mermaidAPI.renderAsync(id, code, callback);
};

export const parse = async (code: string): Promise<boolean> => {
  return await mermaid.parseAsync(code);
};
