import '@testing-library/jest-dom/vitest';
import { beforeAll, vi } from 'vitest';
import 'vitest-dom/extend-expect';

// TODO: Remove once https://github.com/sveltejs/kit/issues/6259 is closed.
beforeAll(() => {
  vi.mock('$app/environment', () => ({
    browser: 'window' in globalThis,
    dev: true
  }));
});
