import { beforeAll, vi } from 'vitest';

// TODO: Remove once https://github.com/sveltejs/kit/issues/6259 is closed.
vi.mock('$app/environment', () => ({
  browser: 'window' in globalThis,
  dev: true
}));

beforeAll(() => {
  if (window.localStorage) return;

  const storage = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', {
    value: {
      clear: () => storage.clear(),
      getItem: (key: string) => storage.get(key) ?? null,
      key: (index: number) => Array.from(storage.keys())[index] ?? null,
      get length() {
        return storage.size;
      },
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value)
    }
  });
});
