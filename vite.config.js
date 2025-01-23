import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit(), svelteTesting()],
  envPrefix: 'MERMAID_',
  optimizeDeps: { include: ['mermaid'] },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://internal-questions-api-dadcb4023286.herokuapp.com',
        changeOrigin: true
        // rewrite: (path) => path.replace(/^\/api/, '') // Optional: rewrite the path
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  },
  test: {
    environment: 'jsdom',
    // in-source testing
    includeSource: ['src/**/*.{js,ts,svelte}'],
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      exclude: ['src/mocks', '.svelte-kit', 'src/**/*.test.ts'],
      reporter: ['text', 'json', 'html', 'lcov']
    }
  }
});
