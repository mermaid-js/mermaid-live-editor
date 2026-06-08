import type { HistoryEntry } from '$lib/types';
import { defaultState, inputStateStore } from '$lib/util/state';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addAutoEntry,
  addManualEntry,
  clearActive,
  historyState,
  injectHistoryIDs,
  removeEntry,
  renameEntry,
  restoreEntries,
  setLoaderEntries,
  setMode,
  startAutoSave,
  stateKey,
  stopAutoSave
} from './historyState.svelte';

const codeState = (code: string) => ({ ...defaultState, code });

/** Read the entries currently shown for a given mode. */
const entriesFor = (mode: 'auto' | 'manual' | 'loader'): HistoryEntry[] => {
  setMode(mode);
  return historyState.entries;
};

beforeEach(() => {
  // Reset every store through the public API so tests don't leak into each other.
  setMode('manual');
  clearActive();
  setMode('auto');
  clearActive();
  setLoaderEntries([]);
  setMode('manual');
});

describe('stateKey', () => {
  it('ignores volatile and view-only fields, keying only on code + config', () => {
    const a = {
      ...defaultState,
      code: 'graph TD\n A-->B',
      panZoom: true,
      renderCount: 1,
      updateDiagram: true
    };
    const b = {
      ...defaultState,
      code: 'graph TD\n A-->B',
      pan: { x: 5, y: 5 },
      panZoom: false,
      renderCount: 99,
      updateDiagram: false
    };
    expect(stateKey(a)).toBe(stateKey(b));
  });

  it('differs when code differs', () => {
    expect(stateKey(codeState('graph TD\n A-->B'))).not.toBe(
      stateKey(codeState('graph TD\n A-->C'))
    );
  });

  it('differs when config differs', () => {
    const a = { ...defaultState, mermaid: '{"theme":"dark"}' };
    const b = { ...defaultState, mermaid: '{"theme":"forest"}' };
    expect(stateKey(a)).not.toBe(stateKey(b));
  });
});

describe('addManualEntry', () => {
  it('adds to the manual store only, never the auto store', () => {
    expect(addManualEntry(codeState('graph TD\n A-->B'))).toBe(true);
    expect(entriesFor('manual')).toHaveLength(1);
    expect(entriesFor('auto')).toHaveLength(0);
  });

  it('returns false and does not add a duplicate of the latest entry', () => {
    const state = codeState('graph TD\n A-->B');
    expect(addManualEntry(state)).toBe(true);
    expect(addManualEntry(state)).toBe(false);
    expect(entriesFor('manual')).toHaveLength(1);
  });

  it('treats states differing only in volatile/view fields as duplicates', () => {
    expect(addManualEntry({ ...defaultState, code: 'graph TD\n A-->B', renderCount: 1 })).toBe(
      true
    );
    expect(
      addManualEntry({
        ...defaultState,
        code: 'graph TD\n A-->B',
        panZoom: false,
        renderCount: 2,
        updateDiagram: true
      })
    ).toBe(false);
    expect(entriesFor('manual')).toHaveLength(1);
  });

  it('adds a new entry when the code changes', () => {
    expect(addManualEntry(codeState('graph TD\n A-->B'))).toBe(true);
    expect(addManualEntry(codeState('graph TD\n A-->C'))).toBe(true);
    expect(entriesFor('manual')).toHaveLength(2);
  });

  it('generates an id and a name for each entry', () => {
    addManualEntry(codeState('graph TD\n A-->B'));
    const [entry] = entriesFor('manual');
    expect(entry.id).toBeTruthy();
    expect(entry.name).toBeTruthy();
    expect(entry.type).toBe('manual');
  });
});

describe('addAutoEntry', () => {
  it('adds to the auto store only, never the manual store', () => {
    expect(addAutoEntry(codeState('graph TD\n A-->B'))).toBe(true);
    expect(entriesFor('auto')).toHaveLength(1);
    expect(entriesFor('manual')).toHaveLength(0);
  });

  it('returns false and does not add a duplicate of the latest entry', () => {
    const state = codeState('graph TD\n A-->B');
    expect(addAutoEntry(state)).toBe(true);
    expect(addAutoEntry(state)).toBe(false);
    expect(entriesFor('auto')).toHaveLength(1);
  });

  it('caps the auto store at 30 entries, dropping the oldest', () => {
    for (let i = 0; i < 35; i++) {
      addAutoEntry(codeState(`graph TD\n A-->B${i}`));
    }
    const entries = entriesFor('auto');
    expect(entries).toHaveLength(30);
    expect(entries[0].state.code).toBe('graph TD\n A-->B34');
  });
});

describe('historyState.entries', () => {
  it('reflects the active mode', () => {
    addManualEntry(codeState('manual-code'));
    addAutoEntry(codeState('auto-code'));

    setMode('manual');
    expect(historyState.entries).toHaveLength(1);
    expect(historyState.entries[0].state.code).toBe('manual-code');

    setMode('auto');
    expect(historyState.entries).toHaveLength(1);
    expect(historyState.entries[0].state.code).toBe('auto-code');

    setMode('loader');
    expect(historyState.entries).toHaveLength(0);
  });
});

describe('removeEntry / clearActive', () => {
  it('removes a single entry from the active store by id', () => {
    addManualEntry(codeState('graph TD\n A-->B'));
    addManualEntry(codeState('graph TD\n A-->C'));
    setMode('manual');
    const target = historyState.entries[1].id;
    removeEntry(target);
    expect(historyState.entries).toHaveLength(1);
    expect(historyState.entries.some((e) => e.id === target)).toBe(false);
  });

  it('clears all entries in the active store only', () => {
    addManualEntry(codeState('graph TD\n A-->B'));
    addAutoEntry(codeState('graph TD\n A-->C'));
    setMode('manual');
    clearActive();
    expect(entriesFor('manual')).toHaveLength(0);
    expect(entriesFor('auto')).toHaveLength(1);
  });

  it('does nothing in loader mode', () => {
    setLoaderEntries([
      { name: 'rev', state: defaultState, time: 1, type: 'loader', url: 'http://x' }
    ]);
    setMode('loader');
    clearActive();
    expect(historyState.entries).toHaveLength(1);
  });
});

describe('renameEntry', () => {
  it('renames an entry in the active (manual) store', () => {
    addManualEntry(codeState('graph TD\n A-->B'));
    setMode('manual');
    renameEntry(historyState.entries[0].id, 'my-custom-name');
    expect(historyState.entries[0].name).toBe('my-custom-name');
  });

  it('renames an entry in the auto store', () => {
    addAutoEntry(codeState('graph TD\n A-->B'));
    setMode('auto');
    renameEntry(historyState.entries[0].id, 'auto-renamed');
    expect(historyState.entries[0].name).toBe('auto-renamed');
  });

  it('only renames the targeted entry and trims the name', () => {
    addManualEntry(codeState('graph TD\n A-->B'));
    addManualEntry(codeState('graph TD\n A-->C'));
    setMode('manual');
    const firstName = historyState.entries[0].name;
    const targetId = historyState.entries[1].id;
    renameEntry(targetId, '  trimmed-name  ');
    expect(historyState.entries[0].name).toBe(firstName);
    expect(historyState.entries[1].name).toBe('trimmed-name');
  });

  it('ignores blank names', () => {
    addManualEntry(codeState('graph TD\n A-->B'));
    setMode('manual');
    const before = historyState.entries[0].name;
    renameEntry(historyState.entries[0].id, '   ');
    expect(historyState.entries[0].name).toBe(before);
  });

  it('does nothing in loader mode', () => {
    setLoaderEntries([
      { name: 'rev', state: defaultState, time: 1, type: 'loader', url: 'http://x' }
    ]);
    setMode('loader');
    const id = historyState.entries[0].id;
    renameEntry(id, 'changed');
    expect(historyState.entries[0].name).toBe('rev');
  });
});

describe('setLoaderEntries', () => {
  it('replaces the in-memory revisions and assigns ids', () => {
    setLoaderEntries([
      { name: 'v1', state: defaultState, time: 1, type: 'loader', url: 'http://x/1' },
      { name: 'v2', state: defaultState, time: 2, type: 'loader', url: 'http://x/2' }
    ]);
    setMode('loader');
    expect(historyState.entries).toHaveLength(2);
    expect(historyState.entries.every((e) => e.id)).toBe(true);

    setLoaderEntries([
      { name: 'only', state: defaultState, time: 3, type: 'loader', url: 'http://x/3' }
    ]);
    expect(historyState.entries).toHaveLength(1);
    expect(historyState.entries[0].name).toBe('only');
  });
});

describe('restoreEntries', () => {
  it('routes each entry to the store matching its own type', () => {
    const result = restoreEntries([
      { id: 'a1', name: 'a', state: defaultState, time: 10, type: 'auto' },
      { id: 'm1', name: 'm', state: defaultState, time: 20, type: 'manual' }
    ]);
    expect(result.restored).toBe(2);
    expect(entriesFor('auto').map((e) => e.id)).toEqual(['a1']);
    expect(entriesFor('manual').map((e) => e.id)).toEqual(['m1']);
  });

  it('skips duplicates by id and reports them', () => {
    restoreEntries([{ id: 'm1', name: 'm', state: defaultState, time: 20, type: 'manual' }]);
    const result = restoreEntries([
      { id: 'm1', name: 'm', state: defaultState, time: 20, type: 'manual' },
      { id: 'm2', name: 'm2', state: defaultState, time: 30, type: 'manual' }
    ]);
    expect(result.restored).toBe(1);
    expect(result.duplicates).toBe(1);
    expect(entriesFor('manual')).toHaveLength(2);
  });

  it('reports invalid entries and does not restore them', () => {
    const result = restoreEntries([
      { id: 'm1', name: 'm', state: defaultState, time: 20, type: 'manual' },
      { foo: 'bar' } as unknown as HistoryEntry
    ]);
    expect(result.restored).toBe(1);
    expect(result.invalid).toBe(1);
  });

  it('sorts restored entries newest first', () => {
    restoreEntries([
      { id: 'm1', name: 'old', state: defaultState, time: 10, type: 'manual' },
      { id: 'm2', name: 'new', state: defaultState, time: 30, type: 'manual' },
      { id: 'm3', name: 'mid', state: defaultState, time: 20, type: 'manual' }
    ]);
    expect(entriesFor('manual').map((e) => e.time)).toEqual([30, 20, 10]);
  });

  it('restores entries whose time is 0 (epoch) instead of treating them as invalid', () => {
    const result = restoreEntries([
      { id: 'm0', name: 'epoch', state: defaultState, time: 0, type: 'manual' }
    ]);
    expect(result.restored).toBe(1);
    expect(result.invalid).toBe(0);
    expect(entriesFor('manual')).toHaveLength(1);
  });
});

describe('injectHistoryIDs migration', () => {
  it('adds ids to persisted entries that lack them', () => {
    window.localStorage.setItem(
      'manualHistoryStore',
      '[{"state":{"code":"a"},"time":1,"type":"manual","name":"x"}]'
    );
    window.localStorage.setItem(
      'autoHistoryStore',
      '[{"state":{"code":"b"},"time":2,"type":"auto","name":"y"}]'
    );
    injectHistoryIDs();
    const manual = JSON.parse(
      window.localStorage.getItem('manualHistoryStore') ?? '[]'
    ) as HistoryEntry[];
    const auto = JSON.parse(
      window.localStorage.getItem('autoHistoryStore') ?? '[]'
    ) as HistoryEntry[];
    expect(manual).toHaveLength(1);
    expect(auto).toHaveLength(1);
    expect(manual.every(({ id }) => id !== undefined)).toBe(true);
    expect(auto.every(({ id }) => id !== undefined)).toBe(true);
  });
});

describe('auto-save lifecycle', () => {
  afterEach(() => {
    stopAutoSave();
    vi.useRealTimers();
  });

  it('records an auto entry on each interval from the current editor state', () => {
    vi.useFakeTimers();
    inputStateStore.set(codeState('graph TD\n auto-saved'));
    startAutoSave();
    vi.advanceTimersByTime(60_000);
    const entries = entriesFor('auto');
    expect(entries).toHaveLength(1);
    expect(entries[0].state.code).toBe('graph TD\n auto-saved');
  });

  it('is idempotent: calling startAutoSave twice does not double-record', () => {
    vi.useFakeTimers();
    inputStateStore.set(codeState('graph TD\n once'));
    startAutoSave();
    startAutoSave();
    vi.advanceTimersByTime(60_000);
    expect(entriesFor('auto')).toHaveLength(1);
  });

  it('stops recording after stopAutoSave', () => {
    vi.useFakeTimers();
    inputStateStore.set(codeState('graph TD\n stoppable'));
    startAutoSave();
    vi.advanceTimersByTime(60_000);
    stopAutoSave();
    inputStateStore.set(codeState('graph TD\n after-stop'));
    vi.advanceTimersByTime(60_000);
    expect(entriesFor('auto')).toHaveLength(1);
  });
});
