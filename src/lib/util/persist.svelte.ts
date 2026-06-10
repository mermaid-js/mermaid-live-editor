/**
 * Runes-based localStorage persistence, shared by the persisted state in
 * `state.svelte.ts`, `migrations.svelte.ts`, `promo.svelte.ts` and History.
 *
 * Values are stored as plain JSON. Reads of missing or corrupt values fall
 * back to the provided default, so values written by older versions of the
 * editor (which serialized plain objects to the same JSON shape) stay loadable.
 */

const hasStorage = (): boolean => typeof window !== 'undefined' && !!window.localStorage;

export const readJSON = <T>(key: string, fallback: T): T => {
  if (!hasStorage()) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    // A stored literal "null" means the value is absent: the pre-runes
    // persistence layer never wrote null and treated it as missing.
    return (JSON.parse(raw) as T) ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeJSON = (key: string, value: unknown): void => {
  if (hasStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

export interface Persisted<T> {
  value: T;
}

// A localStorage-backed reactive value. Reads on init, writes on every set.
// Raw state: replace `value` wholesale to change it. With a deep proxy,
// in-place mutation would update the UI without ever being persisted.
export const persisted = <T>(key: string, initial: T): Persisted<T> => {
  let value = $state.raw<T>(readJSON(key, initial));
  return {
    get value() {
      return value;
    },
    set value(next: T) {
      value = next;
      writeJSON(key, next);
    }
  };
};
