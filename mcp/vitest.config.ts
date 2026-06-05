import { defineConfig } from 'vitest/config';

// Local config so vitest doesn't walk up and load the editor's root vite.config.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts']
  }
});
