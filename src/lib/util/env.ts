// All external service URLs hardcoded to empty for privacy.
// This fork disables all external connectivity.
export const env = {
  analyticsUrl: '',
  docsUrl: '',
  domain: '',
  isEnabledMermaidChartLinks: false,
  krokiRendererUrl: '',
  rendererUrl: ''
} as const;
