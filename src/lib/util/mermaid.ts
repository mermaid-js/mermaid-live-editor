import mermaid from 'mermaid';
// We need to export MermaidConfig and all related types from mermaid.
import type { MermaidConfig } from 'mermaid/dist/config.type';

const init = (async () => {
	mermaid.initialize({
		lazyLoadedDiagrams: [
			// We should make SRI mandatory for all lazy-loaded diagrams.
			'https://unpkg.com/@mermaid-js/mermaid-mindmap@9.2.0-rc2/dist/mermaid-mindmap-detector.esm.mjs'
		]
	});
	// Lazy loading should be moved from init to initialize.
	await mermaid.init();
})();

export const render = async (
	config: MermaidConfig,
	code: string,
	id: string,
	callback: Parameters<typeof mermaid.render>[2]
): Promise<void> => {
	await init;
	// Should be able to call this multiple times without any issues.
	// await mermaid.initialize({
	// 	...config,
	// 	lazyLoadedDiagrams: [
	// 		// We should make SRI mandatory for all lazy-loaded diagrams.
	// 		'https://unpkg.com/@mermaid-js/mermaid-mindmap@9.2.0-rc2/dist/mermaid-mindmap-detector.esm.mjs'
	// 	]
	// });
	await mermaid.mermaidAPI.renderAsync(id, code, callback);
};

// export const parse = mermaid.parse;
export const parse = (_: string) => {
	// Parse doesn't work.
};
