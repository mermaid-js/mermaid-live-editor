/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MERMAID_RENDERER_URL?: string;
  readonly MERMAID_KROKI_RENDERER_URL?: string;
  readonly MERMAID_CDN_URL?: string;
  readonly MERMAID_BASE_URL?: string;
  readonly MERMAID_LOCAL?: boolean;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
