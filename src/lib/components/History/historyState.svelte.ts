import type { HistoryEntry, HistoryType, Optional, State } from '$lib/types';
import { inputStateStore } from '$lib/util/state';
import { logEvent } from '$lib/util/stats';
import { generateSlug } from 'random-word-slugs';
import { get } from 'svelte/store';
import { v4 as uuidV4 } from 'uuid';

const MAX_AUTO_HISTORY_LENGTH = 30;
const AUTO_SAVE_INTERVAL = 60_000;

const hasStorage = (): boolean => typeof window !== 'undefined' && !!window.localStorage;

const readJSON = <T>(key: string, fallback: T): T => {
  if (!hasStorage()) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown): void => {
  if (hasStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

interface Persisted<T> {
  value: T;
}

// A localStorage-backed reactive value. Reads on init, writes on every set.
const persisted = <T>(key: string, initial: T): Persisted<T> => {
  let value = $state<T>(readJSON(key, initial));
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

const auto = persisted<HistoryEntry[]>('autoHistoryStore', []);
const manual = persisted<HistoryEntry[]>('manualHistoryStore', []);
const mode = persisted<HistoryType>('autoHistoryMode', 'manual');
let loader = $state<HistoryEntry[]>([]);

// Loader entries are in-memory, so a persisted 'loader' mode is empty after reload.
if (mode.value === 'loader') {
  mode.value = 'manual';
}

// The persisted slot backing a mode; loader is in-memory and has no slot.
const slotFor = (m: HistoryType): Persisted<HistoryEntry[]> | null => {
  switch (m) {
    case 'auto': {
      return auto;
    }
    case 'manual': {
      return manual;
    }
    default: {
      return null;
    }
  }
};

export const historyState = {
  get entries(): HistoryEntry[] {
    return slotFor(mode.value)?.value ?? loader;
  },
  get loaderEntries(): HistoryEntry[] {
    return loader;
  },
  get mode(): HistoryType {
    return mode.value;
  }
};

export const setMode = (next: HistoryType): void => {
  mode.value = next;
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
  slot: Persisted<HistoryEntry[]>,
  state: State,
  type: 'auto' | 'manual',
  maxLength?: number
): boolean => {
  const entries = slot.value;
  if (entries.length > 0 && stateKey(entries[0].state) === stateKey(state)) {
    return false;
  }
  const trimmed =
    maxLength && entries.length >= maxLength ? entries.slice(0, maxLength - 1) : entries;
  slot.value = [createEntry(state, type), ...trimmed];
  logEvent('history', { action: 'save', type });
  return true;
};

export const addManualEntry = (state: State): boolean => addEntry(manual, state, 'manual');

export const addAutoEntry = (state: State): boolean =>
  addEntry(auto, state, 'auto', MAX_AUTO_HISTORY_LENGTH);

// Replaces the in-memory revisions (e.g. when a gist is loaded), assigning ids.
export const setLoaderEntries = (entries: Optional<HistoryEntry, 'id'>[]): void => {
  loader = entries.map((entry) =>
    entry.id ? (entry as HistoryEntry) : { ...entry, id: uuidV4() }
  );
};

export const removeEntry = (id: string): void => {
  const slot = slotFor(mode.value);
  if (!slot) {
    return;
  }
  slot.value = slot.value.filter((entry) => entry.id !== id);
  logEvent('history', { action: 'clear', type: 'single' });
};

export const clearActive = (): void => {
  const slot = slotFor(mode.value);
  if (!slot) {
    return;
  }
  slot.value = [];
  logEvent('history', { action: 'clear', type: 'all' });
};

const validateEntry = (entry: HistoryEntry): boolean =>
  Boolean(entry && entry.type && entry.state) && typeof entry.time === 'number';

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

  const slots: [HistoryType, Persisted<HistoryEntry[]>][] = [
    ['auto', auto],
    ['manual', manual]
  ];
  for (const [type, slot] of slots) {
    const incoming = valid.filter((entry) => entry.type === type);
    if (incoming.length === 0) {
      continue;
    }
    const existingIDs = slot.value.map(({ id }) => id);
    const fresh = incoming.filter(({ id }) => !existingIDs.includes(id));
    restored += fresh.length;
    slot.value = [...slot.value, ...fresh].sort((a, b) => b.time - a.time);
  }

  const duplicates = valid.length - restored;
  logEvent('history', { action: 'restore', duplicates, invalid, success: restored });
  return { restored, invalid, duplicates };
};

const setIDs = (entries: HistoryEntry[]): HistoryEntry[] =>
  entries.map((entry) => (entry.id ? entry : { ...entry, id: uuidV4() }));

// One-time migration: re-reads localStorage so entries written by an older
// version get ids, then persists and updates the reactive state.
export const injectHistoryIDs = (): void => {
  auto.value = setIDs(readJSON<HistoryEntry[]>('autoHistoryStore', []));
  manual.value = setIDs(readJSON<HistoryEntry[]>('manualHistoryStore', []));
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
