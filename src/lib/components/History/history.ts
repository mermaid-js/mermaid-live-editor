import type { HistoryEntry, HistoryType, Optional, State } from '$lib/types';
import { localStorage, persist } from '$lib/util/persist';
import { inputStateStore } from '$lib/util/state';
import { logEvent } from '$lib/util/stats';
import { generateSlug } from 'random-word-slugs';
import type { Readable, Writable } from 'svelte/store';
import { derived, get, writable } from 'svelte/store';
import { v4 as uuidV4 } from 'uuid';

const MAX_AUTO_HISTORY_LENGTH = 30;
const AUTO_SAVE_INTERVAL = 60_000;

const autoHistoryStore: Writable<HistoryEntry[]> = persist(
  writable([]),
  localStorage(),
  'autoHistoryStore'
);

const manualHistoryStore: Writable<HistoryEntry[]> = persist(
  writable([]),
  localStorage(),
  'manualHistoryStore'
);

// Populated by file loaders (e.g. gist); in-memory only.
export const loaderHistoryStore: Writable<HistoryEntry[]> = writable([]);

export const historyModeStore: Writable<HistoryType> = persist(
  writable('manual'),
  localStorage(),
  'autoHistoryMode'
);

// Loader entries are in-memory, so a persisted 'loader' mode is empty after reload.
if (get(historyModeStore) === 'loader') {
  historyModeStore.set('manual');
}

const storeForMode = (mode: HistoryType): Writable<HistoryEntry[]> => {
  switch (mode) {
    case 'auto': {
      return autoHistoryStore;
    }
    case 'loader': {
      return loaderHistoryStore;
    }
    default: {
      return manualHistoryStore;
    }
  }
};

export const historyStore: Readable<HistoryEntry[]> = derived(
  [historyModeStore, autoHistoryStore, manualHistoryStore, loaderHistoryStore],
  ([mode, auto, manual, loader]) => {
    switch (mode) {
      case 'auto': {
        return auto;
      }
      case 'loader': {
        return loader;
      }
      default: {
        return manual;
      }
    }
  }
);

export const setMode = (mode: HistoryType): void => {
  historyModeStore.set(mode);
};

// Dedup key: only the fields that define the diagram, so volatile/view-only
// fields (renderCount, pan/zoom, …) don't count as a change.
export const stateKey = (state: State): string =>
  JSON.stringify({ code: state.code, mermaid: state.mermaid });

const createEntry = (state: State, type: 'auto' | 'manual'): HistoryEntry => ({
  id: uuidV4(),
  name: generateSlug(2),
  state,
  time: Date.now(),
  type
});

// Returns true if added, false if it duplicated the most recent entry.
const addEntry = (
  store: Writable<HistoryEntry[]>,
  state: State,
  type: 'auto' | 'manual',
  maxLength?: number
): boolean => {
  const entries = get(store);
  if (entries.length > 0 && stateKey(entries[0].state) === stateKey(state)) {
    return false;
  }
  store.update((existing) => {
    const trimmed =
      maxLength && existing.length >= maxLength ? existing.slice(0, maxLength - 1) : existing;
    return [createEntry(state, type), ...trimmed];
  });
  logEvent('history', { action: 'save', type });
  return true;
};

export const addManualEntry = (state: State): boolean =>
  addEntry(manualHistoryStore, state, 'manual');

export const addAutoEntry = (state: State): boolean =>
  addEntry(autoHistoryStore, state, 'auto', MAX_AUTO_HISTORY_LENGTH);

export const addLoaderEntry = (entry: Optional<HistoryEntry, 'id'>): void => {
  loaderHistoryStore.update((entries) => [{ ...entry, id: uuidV4() } as HistoryEntry, ...entries]);
};

export const removeEntry = (id: string): void => {
  const mode = get(historyModeStore);
  if (mode === 'loader') {
    return;
  }
  storeForMode(mode).update((entries) => entries.filter((entry) => entry.id !== id));
  logEvent('history', { action: 'clear', type: 'single' });
};

export const clearActive = (): void => {
  const mode = get(historyModeStore);
  if (mode === 'loader') {
    return;
  }
  storeForMode(mode).set([]);
  logEvent('history', { action: 'clear', type: 'all' });
};

const validateEntry = (entry: HistoryEntry): boolean =>
  Boolean(entry && entry.type && entry.state && entry.time);

export interface RestoreResult {
  restored: number;
  invalid: number;
  duplicates: number;
}

// Routes each uploaded entry to the store matching its own type, skipping ids
// that already exist.
export const restoreEntries = (data: HistoryEntry[]): RestoreResult => {
  const valid = data.filter((entry) => validateEntry(entry));
  const invalid = data.length - valid.length;
  let restored = 0;

  for (const type of ['auto', 'manual'] as const) {
    const incoming = valid.filter((entry) => entry.type === type);
    if (incoming.length === 0) {
      continue;
    }
    storeForMode(type).update((existing) => {
      const existingIDs = new Set(existing.map(({ id }) => id));
      const fresh = incoming.filter(({ id }) => !existingIDs.has(id));
      restored += fresh.length;
      return [...existing, ...fresh].sort((a, b) => b.time - a.time);
    });
  }

  const duplicates = valid.length - restored;
  logEvent('history', { action: 'restore', success: restored, invalid, duplicates });
  return { restored, invalid, duplicates };
};

const setIDs = (entries: HistoryEntry[]) => {
  for (const entry of entries) {
    if (!entry.id) {
      entry.id = uuidV4();
    }
  }
  return entries;
};

export const injectHistoryIDs = (): void => {
  autoHistoryStore.update(setIDs);
  manualHistoryStore.update(setIDs);
};

let autoSaveTimer: ReturnType<typeof setInterval> | undefined;

// Idempotent; returns the stop function for use as a lifecycle cleanup.
export const startAutoSave = (): (() => void) => {
  if (autoSaveTimer === undefined) {
    autoSaveTimer = setInterval(() => addAutoEntry(get(inputStateStore)), AUTO_SAVE_INTERVAL);
  }
  return stopAutoSave;
};

export const stopAutoSave = (): void => {
  if (autoSaveTimer !== undefined) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = undefined;
  }
};
