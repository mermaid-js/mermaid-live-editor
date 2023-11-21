/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MERMAID_RENDERER_URL?: string;
  readonly MERMAID_KROKI_RENDERER_URL?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
