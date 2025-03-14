export const env = {
  analyticsUrl: import.meta.env.MERMAID_ANALYTICS_URL ?? '',
  domain: import.meta.env.MERMAID_DOMAIN ?? '',
  isEnabledMermaidChartLinks: import.meta.env.MERMAID_IS_ENABLED_MERMAID_CHART_LINKS === 'true',
  krokiRendererUrl: import.meta.env.MERMAID_KROKI_RENDERER_URL ?? '',
  rendererUrl: import.meta.env.MERMAID_RENDERER_URL ?? ''
} as const;
