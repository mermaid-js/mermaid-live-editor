import { sveltekit } from '@sveltejs/kit/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vitest/config';

/**
 * HMR creates state inconsistencies, so we always reload the page.
 * @type {import('vite').PluginOption} PluginOption
 */
const alwaysFullReload = {
  name: 'always-full-reload',
  handleHotUpdate({ server }) {
    server.ws.send({ type: 'full-reload' });
    return [];
  }
};

export default defineConfig({
  plugins: [
    sveltekit(),
    Icons({
      compiler: 'svelte',
      customCollections: {
        custom: FileSystemIconLoader('./static/icons')
      }
    }),
    alwaysFullReload
  ],
  envPrefix: 'MERMAID_',
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 3000,
    host: true
  },
  test: {
    environment: 'jsdom',
    // in-source testing
    includeSource: ['src/**/*.{js,ts,svelte}'],
    // Ignore E2E tests
    exclude: [
      'tests/**/*',
      '**\/node_modules/**',
      '**\/dist/**',
      '**\/.{idea,git,cache,output,temp}/**',
      '**\/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'
    ],
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      exclude: ['src/mocks', '.svelte-kit', 'src/**/*.test.ts'],
      reporter: ['text', 'json', 'html', 'lcov']
    }
  }
});
