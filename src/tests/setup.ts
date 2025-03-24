import { beforeAll, vi } from 'vitest';

// TODO: Remove once https://github.com/sveltejs/kit/issues/6259 is closed.
beforeAll(() => {
  vi.mock('$app/environment', () => ({
    browser: 'window' in globalThis,
    dev: true
  }));
});
