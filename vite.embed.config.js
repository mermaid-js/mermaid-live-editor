import { defineConfig } from 'vite';

// Builds the standalone <mermaid-embed> loader (src/embed-loader.ts) into static/embed.js,
// which the SvelteKit build then ships verbatim as /embed.js. Run via `pnpm build:embed`
// (chained into `pnpm dev` and `pnpm build`); the output file is gitignored.
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/embed-loader.ts',
      fileName: () => 'embed.js',
      formats: ['iife'],
      name: 'mermaidEmbed'
    },
    minify: false,
    outDir: 'static'
  }
});
