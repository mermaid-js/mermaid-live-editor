import mermaid from 'mermaid';
// We need to export MermaidConfig and all related types from mermaid.
import type { MermaidConfig } from 'mermaid/dist/config.type';
import { env } from './env';
const { mermaidBaseURL, mermaidCDNUrl, useLocalMermaid } = env;

const getDiagramURL = (name: string, version: string): string => {
	if (useLocalMermaid) {
		return `${mermaidBaseURL}/${name}-detector.esm.mjs`;
	}
	return `${mermaidCDNUrl}/${name}@${version}/dist/${name}-detector.esm.mjs`;
};

const initialize = mermaid.initializeAsync({
	// logLevel: 0,
	lazyLoadedDiagrams: [getDiagramURL('mermaid-mindmap', '9.2.0-rc4')],
	loadExternalDiagramsAtStartup: true
});

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
	return mermaid.parseAsync(code);
};
