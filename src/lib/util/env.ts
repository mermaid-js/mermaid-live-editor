export const rendererUrl: string =
	(import.meta.env.MERMAID_RENDERER_URL as string) ?? 'https://mermaid.ink';
export const krokiRendererUrl: string =
	(import.meta.env.MERMAID_KROKI_RENDERER_URL as string) ?? 'https://kroki.io';
export const mermaidCDNUrl: string =
	(import.meta.env.MERMAID_CDN_URL as string) ?? 'https://unpkg.com/@mermaid-js';
export const mermaidBaseURL =
	(import.meta.env.MERMAID_BASE_URL as string) ?? 'http://localhost:9000';
export const isDev = import.meta.env.DEV;
export const baseURL = import.meta.env.BASE_URL;
