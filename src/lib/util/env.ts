export const rendererUrl: string =
	(import.meta.env.MERMAID_RENDERER_URL as string) ?? 'https://mermaid.ink';
export const krokiRendererUrl: string =
	(import.meta.env.MERMAID_KROKI_RENDERER_URL as string) ?? 'https://kroki.io';
export const debounceEnabled: boolean = import.meta.env.MERMAID_DISABLE_DEBOUNCE !== 'true';
