/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MERMAID_RENDERER_URL?: string;
  readonly MERMAID_KROKI_RENDERER_URL?: string;
  readonly MERMAID_ANALYTICS_URL?: string;
  readonly MERMAID_DOMAIN?: string;
  readonly MERMAID_IS_ENABLED_MERMAID_CHART_LINKS?: string;
  readonly MERMAID_FIREBASE_API_KEY?: string;
  readonly MERMAID_FIREBASE_AUTH_DOMAIN?: string;
  readonly MERMAID_FIREBASE_PROJECT_ID?: string;
  readonly MERMAID_FIREBASE_STORAGE_BUCKET?: string;
  readonly MERMAID_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly MERMAID_FIREBASE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
