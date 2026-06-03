import type { State } from '$/types';
import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  activeDiagramId,
  diagramsStore,
  foldersStore,
  loadDiagram,
  refreshSavedDiagrams,
  saveCurrentAsNew
} from './savedDiagrams';
import { deserializeState, serializeState } from './serde';
import { inputStateStore } from './state';

const ok = (data: unknown) => ({ ok: true, status: 200, json: () => Promise.resolve(data) });

const sampleState: State = {
  code: 'graph TD; A-->B',
  mermaid: '{"theme":"default"}',
  updateDiagram: true,
  rough: false
};

describe('savedDiagrams data layer', () => {
  beforeEach(() => {
    foldersStore.set([]);
    diagramsStore.set([]);
    activeDiagramId.set(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('refresh loads folders and diagrams into the stores', async () => {
    const folders = [{ id: 'f1', name: 'A', parentId: null, createdAt: 't' }];
    const diagrams = [{ createdAt: 't', folderId: null, id: 'd1', name: 'D', updatedAt: 't' }];
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve(ok(String(url).includes('/folders') ? folders : diagrams))
      )
    );

    await refreshSavedDiagrams();

    expect(get(foldersStore)).toEqual(folders);
    expect(get(diagramsStore)).toEqual(diagrams);
  });

  it('saveCurrentAsNew sends the serialized state and tracks the new id', async () => {
    inputStateStore.set(sampleState);
    let captured: { name: string; folderId: string | null; payload: string } | undefined;

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.endsWith('/diagrams') && init?.method === 'POST') {
          captured = JSON.parse(String(init.body));
          return Promise.resolve(ok({ id: 'new-id' }));
        }
        return Promise.resolve(ok([])); // refresh folders + diagrams
      })
    );

    await saveCurrentAsNew('My diagram', 'f1');

    if (!captured) {
      throw new Error('No POST /diagrams request was captured');
    }
    expect(captured.name).toBe('My diagram');
    expect(captured.folderId).toBe('f1');
    // The payload must round-trip back to the editor state.
    expect(deserializeState(captured.payload)).toMatchObject({ code: sampleState.code });
    expect(get(activeDiagramId)).toBe('new-id');
  });

  it('loadDiagram deserializes the payload into the editor and marks it active', async () => {
    const payload = serializeState(sampleState);
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          ok({ createdAt: 't', folderId: null, id: 'd9', name: 'X', payload, updatedAt: 't' })
        )
      )
    );

    await loadDiagram('d9');

    const loaded = get(inputStateStore);
    expect(loaded.code).toBe(sampleState.code);
    expect(loaded.updateDiagram).toBe(true);
    expect(get(activeDiagramId)).toBe('d9');
  });
});
