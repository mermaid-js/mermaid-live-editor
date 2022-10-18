import mermaid from 'mermaid';
// We need to export MermaidConfig and all related types from mermaid.
import type { MermaidConfig } from 'mermaid/dist/config.type';
import { env } from './env';
import queue from 'async/queue';
import type { QueueObject } from 'async';
const { mermaidBaseURL, mermaidCDNUrl, useLocalMermaid } = env;

const getDiagramURL = (name: string, version: string): string => {
	if (useLocalMermaid) {
		return `${mermaidBaseURL}/${name}-detector.esm.mjs`;
	}
	return `${mermaidCDNUrl}/${name}@${version}/dist/${name}-detector.esm.mjs`;
};

const initialize = mermaid.initializeAsync({
	logLevel: 0,
	lazyLoadedDiagrams: [getDiagramURL('mermaid-mindmap', '9.2.0-rc4')],
	loadExternalDiagramsAtStartup: true
});

export const init = async () => {
	await initialize;
};

interface RenderPayload {
	config: MermaidConfig;
	code: string;
	id: string;
	callback: Parameters<typeof mermaid.render>[2];
}

interface ParsePayload {
	code: string;
}
interface MermaidTask {
	action: 'render' | 'parse';
	payload: RenderPayload | ParsePayload;
}

const mermaidQueue: QueueObject<MermaidTask> = queue(async (task: MermaidTask) => {
	console.log('adding ', task);
	if (task.action === 'render') {
		const { config, code, id, callback } = task.payload as RenderPayload;
		await mermaid.mermaidAPI.renderAsync(id, code, callback);
	}
	console.log('done', task);
}, 1);

mermaidQueue.error(function (err, task) {
	console.error('task experienced an error', task, err);
});

export const render = async (payload: RenderPayload): Promise<void> => {
	// Should be able to call this multiple times without any issues.
	// await mermaid.initialize({
	// 	...config,
	// 	lazyLoadedDiagrams: [
	// 		// We should make SRI mandatory for all lazy-loaded diagrams.
	// 		'https://unpkg.com/@mermaid-js/mermaid-mindmap@9.2.0-rc2/dist/mermaid-mindmap-detector.esm.mjs'
	// 	]
	// });
	// console.log('Rendering', code);
	// mermaid.mermaidAPI.render(id, code, callback);
	await mermaidQueue.push({
		action: 'render',
		payload
	});
};

export const parse = async (code: string): Promise<boolean> => {
	await init();
	return mermaid.parseAsync(code);
};
