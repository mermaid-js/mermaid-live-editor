/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_API_BASE_URL: string;
  VITE_MERMAID_DOMAIN: string;
  VITE_MERMAID_ANALYTICS_URL: string;
  VITE_MERMAID_RENDERER_URL: string;
  VITE_MERMAID_KROKI_RENDERER_URL: string;
  VITE_MERMAID_IS_ENABLED_MERMAID_CHART_LINKS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
