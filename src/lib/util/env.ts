export const env = {
  analyticsUrl: import.meta.env.MERMAID_ANALYTICS_URL ?? '',
  apiKey: import.meta.env.MERMAID_FIREBASE_API_KEY ?? '',
  appId: import.meta.env.MERMAID_FIREBASE_APP_ID ?? '',
  authDomain: import.meta.env.MERMAID_FIREBASE_AUTH_DOMAIN ?? '',
  domain: import.meta.env.MERMAID_DOMAIN ?? '',
  isEnabledMermaidChartLinks: import.meta.env.MERMAID_IS_ENABLED_MERMAID_CHART_LINKS === 'true',
  krokiRendererUrl: import.meta.env.MERMAID_KROKI_RENDERER_URL ?? '',
  messagingSenderId: import.meta.env.MERMAID_FIREBASE_MESSAGING_SENDER_ID ?? '',
  projectId: import.meta.env.MERMAID_FIREBASE_PROJECT_ID ?? '',
  rendererUrl: import.meta.env.MERMAID_RENDERER_URL ?? '',
  storageBucket: import.meta.env.MERMAID_FIREBASE_STORAGE_BUCKET ?? ''
} as const;
