import type { HistoryEntry } from '$lib/types';
import { defaultState } from '$lib/util/state';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import {
  addHistoryEntry,
  clearHistoryData,
  historyModeStore,
  historyStore,
  injectHistoryIDs
} from './history';

describe('history', () => {
  it('should handle saving individual history entry', () => {
    expect(window.localStorage.getItem('manualHistoryStore')).toBe('[]');
    expect(window.localStorage.getItem('autoHistoryStore')).toBe('[]');

    addHistoryEntry({
      state: defaultState,
      time: 12_345,
      type: 'manual'
    });

    const [manualEntry] = JSON.parse(
      window.localStorage.getItem('manualHistoryStore') ?? '[]'
    ) as HistoryEntry[];

    expect(manualEntry.time).toBe(12_345);
    expect(manualEntry.type).toBe('manual');
    expect(manualEntry.name).not.toBeNull();
    expect(manualEntry.state).not.toBeNull();

    addHistoryEntry({
      state: defaultState,
      time: 54_321,
      type: 'auto'
    });

    const [autoEntry] = JSON.parse(
      window.localStorage.getItem('autoHistoryStore') ?? '[]'
    ) as HistoryEntry[];

    expect(autoEntry.time).toBe(54_321);
    expect(autoEntry.type).toBe('auto');
    expect(autoEntry.name).not.toBeNull();
    expect(autoEntry.state).not.toBeNull();

    historyModeStore.set('manual');
    clearHistoryData();
    historyModeStore.set('auto');
    clearHistoryData();
    expect(window.localStorage.getItem('manualHistoryStore')).toBe('[]');
    expect(window.localStorage.getItem('autoHistoryStore')).toBe('[]');
  });

  it('should clear history entries', () => {
    addHistoryEntry({
      state: defaultState,
      time: 12_345,
      type: 'manual'
    });
    addHistoryEntry({
      state: { ...defaultState, code: 'graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)' },
      time: 123_456,
      type: 'manual'
    });

    historyModeStore.set('manual');
    const store: HistoryEntry[] = get(historyStore);
    expect(store.length).toBe(2);
    clearHistoryData(store[1].id);
    expect(get(historyStore).length).toBe(1);
    clearHistoryData();
    expect(get(historyStore).length).toBe(0);

    historyModeStore.set('auto');
    addHistoryEntry({
      state: defaultState,
      time: 54_321,
      type: 'auto'
    });
    addHistoryEntry({
      state: { ...defaultState, code: 'graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)' },
      time: 654_321,
      type: 'auto'
    });
    expect(get(historyStore).length).toBe(2);
    clearHistoryData();
    expect(get(historyStore).length).toBe(0);
    // Test calling when history is empty
    clearHistoryData();
    expect(get(historyStore).length).toBe(0);
  });
});

describe('history migration', () => {
  it('should inject history IDs as migration', () => {
    window.localStorage.setItem(
      'manualHistoryStore',
      '[{"state":{"code":"graph TD\\n    A[Halloween] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":false},"time":0,"type":"manual","name":"hollow-art"},{"state":{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":true},"time":0,"type":"manual","name":"helpful-ocean"}]'
    );
    window.localStorage.setItem(
      'autoHistoryStore',
      '[{"state":{"code":"graph TD\\n    A[New Year] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":false},"time":0,"type":"auto","name":"barking-dog"},{"state":{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":true},"time":0,"type":"manual","name":"needy-mosquito"}]'
    );
    let manualHistoryStore = JSON.parse(
        window.localStorage.getItem('manualHistoryStore') ?? '[]'
      ) as HistoryEntry[],
      autoHistoryStore = JSON.parse(
        window.localStorage.getItem('autoHistoryStore') ?? '[]'
      ) as HistoryEntry[];
    expect(manualHistoryStore.every(({ id }) => id !== undefined)).toBe(false);
    expect(autoHistoryStore.every(({ id }) => id !== undefined)).toBe(false);

    injectHistoryIDs();

    manualHistoryStore = JSON.parse(
      window.localStorage.getItem('manualHistoryStore') ?? '[]'
    ) as HistoryEntry[];
    autoHistoryStore = JSON.parse(
      window.localStorage.getItem('autoHistoryStore') ?? '[]'
    ) as HistoryEntry[];
    expect(manualHistoryStore.every(({ id }) => id !== undefined)).toBe(true);
    expect(autoHistoryStore.every(({ id }) => id !== undefined)).toBe(true);
  });
});
