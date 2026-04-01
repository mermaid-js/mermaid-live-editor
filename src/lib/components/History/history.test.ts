import type { HistoryEntry } from '$lib/types';
import { defaultState } from '$lib/util/state';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import {
  addHistoryEntry,
  clearHistoryData,
  historyModeStore,
  historyStore,
  injectHistoryIDs,
  renameHistoryEntry
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

describe('rename history entry', () => {
  it('should rename a manual history entry', () => {
    historyModeStore.set('manual');
    clearHistoryData();

    addHistoryEntry({
      state: defaultState,
      time: 99_999,
      type: 'manual'
    });

    const entries = get(historyStore);
    expect(entries.length).toBe(1);
    const originalName = entries[0].name;
    expect(originalName).toBeDefined();

    renameHistoryEntry(entries[0].id, 'my-custom-name');
    expect(get(historyStore)[0].name).toBe('my-custom-name');

    clearHistoryData();
  });

  it('should rename an auto history entry', () => {
    historyModeStore.set('auto');
    clearHistoryData();

    addHistoryEntry({
      state: defaultState,
      time: 88_888,
      type: 'auto'
    });

    const entries = get(historyStore);
    expect(entries.length).toBe(1);

    renameHistoryEntry(entries[0].id, 'auto-renamed');
    expect(get(historyStore)[0].name).toBe('auto-renamed');

    clearHistoryData();
    historyModeStore.set('manual');
    clearHistoryData();
  });

  it('should only rename the targeted entry', () => {
    historyModeStore.set('manual');
    clearHistoryData();

    addHistoryEntry({ state: defaultState, time: 1, type: 'manual' });
    addHistoryEntry({
      state: { ...defaultState, code: 'graph LR\\n    A --> B' },
      time: 2,
      type: 'manual'
    });

    const entries = get(historyStore);
    expect(entries.length).toBe(2);

    const secondId = entries[1].id;
    const firstName = entries[0].name;

    renameHistoryEntry(secondId, 'only-this-one');
    const updated = get(historyStore);
    expect(updated[0].name).toBe(firstName);
    expect(updated[1].name).toBe('only-this-one');

    clearHistoryData();
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
