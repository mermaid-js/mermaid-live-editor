export const env = {
  rendererUrl: import.meta.env.MERMAID_RENDERER_URL ?? 'https://mermaid.ink',
  krokiRendererUrl: import.meta.env.MERMAID_KROKI_RENDERER_URL ?? 'https://kroki.io',
  mermaidCDNUrl: import.meta.env.MERMAID_CDN_URL ?? 'https://unpkg.com/@mermaid-js',
  mermaidBaseURL: import.meta.env.MERMAID_BASE_URL ?? 'http://localhost:9000',
  useLocalMermaid: import.meta.env.MERMAID_LOCAL ?? false,
  isDev: import.meta.env.DEV,
  baseURL: import.meta.env.BASE_URL
};
