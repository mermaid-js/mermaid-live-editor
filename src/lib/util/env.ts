export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  analyticsUrl: import.meta.env.VITE_MERMAID_ANALYTICS_URL,
  domain: import.meta.env.VITE_MERMAID_DOMAIN,
  isEnabledMermaidChartLinks: import.meta.env.VITE_MERMAID_IS_ENABLED_MERMAID_CHART_LINKS,
  krokiRendererUrl: import.meta.env.VITE_MERMAID_KROKI_RENDERER_URL,
  rendererUrl: import.meta.env.VITE_MERMAID_RENDERER_URL
} as const;
