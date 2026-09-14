import type { HistoryEntry, State } from '$lib/types';
import { beforeEach, describe, expect, it } from 'vitest';

describe('migrations', () => {
  beforeEach(() => {
    window.localStorage.setItem(
      'manualHistoryStore',
      '[{"state":{"code":"graph TD\\n    A[Halloween] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":false},"time":0,"type":"manual","name":"hollow-art"},{"state":{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":true},"time":0,"type":"manual","name":"helpful-ocean"}]'
    );
    window.localStorage.setItem(
      'autoHistoryStore',
      '[{"state":{"code":"graph TD\\n    A[New Year] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":false},"time":0,"type":"auto","name":"barking-dog"},{"state":{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":true},"time":0,"type":"manual","name":"needy-mosquito"}]'
    );
    // The config every pre-mermaid-12 install was seeded with.
    window.localStorage.setItem(
      'codeStore',
      '{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"default\\"\\n}","updateDiagram":true}'
    );
  });

  it('should apply every pending migration on a fresh install', async () => {
    // Mirror the app's import order: the (app) layout loads the state module,
    // which pulls in util.ts and the migrations, which import the state module
    // back. The migration registry must not touch those exports at load time.
    await import('./state.svelte');
    const { applyMigrations } = await import('./migrations.svelte');
    let manualHistoryStore: HistoryEntry[] = JSON.parse(
      window.localStorage.getItem('manualHistoryStore') ?? '[]'
    ) as HistoryEntry[];
    let autoHistoryStore: HistoryEntry[] = JSON.parse(
      window.localStorage.getItem('autoHistoryStore') ?? '[]'
    ) as HistoryEntry[];
    expect(manualHistoryStore.every(({ id }) => id !== undefined)).toBe(false);
    expect(autoHistoryStore.every(({ id }) => id !== undefined)).toBe(false);

    applyMigrations();

    // injectHistoryIDs
    manualHistoryStore = JSON.parse(
      window.localStorage.getItem('manualHistoryStore') ?? '[]'
    ) as HistoryEntry[];
    autoHistoryStore = JSON.parse(
      window.localStorage.getItem('autoHistoryStore') ?? '[]'
    ) as HistoryEntry[];
    expect(manualHistoryStore.every(({ id }) => id !== undefined)).toBe(true);
    expect(autoHistoryStore.every(({ id }) => id !== undefined)).toBe(true);

    // clearDefaultThemeConfig: a config that only pinned "theme": "default" is emptied.
    const codeStore = JSON.parse(window.localStorage.getItem('codeStore') ?? '{}') as State;
    expect(codeStore.mermaid).toBe('{}');
    expect(codeStore.code).toContain('Christmas');
  });
});
