import type { HistoryEntry } from '$lib/types';
import { describe, it, expect, beforeEach } from 'vitest';

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
  });

  it('should migrate from v0 to v1', async () => {
    const { applyMigrations } = await import('./migrations');
    let manualHistoryStore: HistoryEntry[] = JSON.parse(
      window.localStorage.getItem('manualHistoryStore') ?? '[]'
    ) as HistoryEntry[];
    let autoHistoryStore: HistoryEntry[] = JSON.parse(
      window.localStorage.getItem('autoHistoryStore') ?? '[]'
    ) as HistoryEntry[];
    expect(manualHistoryStore.every(({ id }) => id !== undefined)).toBe(false);
    expect(autoHistoryStore.every(({ id }) => id !== undefined)).toBe(false);

    applyMigrations();

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
