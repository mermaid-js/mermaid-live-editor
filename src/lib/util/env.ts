export const env = {
  rendererUrl: import.meta.env.MERMAID_RENDERER_URL ?? 'https://mermaid.ink',
  krokiRendererUrl: import.meta.env.MERMAID_KROKI_RENDERER_URL ?? 'https://kroki.io',
  analyticsUrl: import.meta.env.MERMAID_ANALYTICS_URL ?? '',
  domain: import.meta.env.MERMAID_DOMAIN ?? 'mermaid.live'
} as const;
