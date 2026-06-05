import { fromUint8Array } from 'js-base64';
import { deflate } from 'pako';

// Payload encoder — a copy of the editor's `pakoSerde`/`serializeState`
// (src/lib/util/serde.ts). The `pako:` wire format is a hard compatibility
// contract with the editor, so this is intentionally a small, stable copy
// rather than a cross-package import (the editor module pulls in SvelteKit
// `$lib` aliases that don't resolve under tsx). serde.test.ts guards drift.

/** Minimal subset of the editor's `State` needed to persist a fresh diagram. */
export interface State {
  code: string;
  mermaid: string;
  updateDiagram: boolean;
  rough: boolean;
}

export const serializeState = (state: State): string => {
  const json = JSON.stringify(state);
  const compressed = deflate(new TextEncoder().encode(json), { level: 9 });
  return `pako:${fromUint8Array(compressed, true)}`;
};

/**
 * Build a diagram `payload` from raw Mermaid source, matching the editor's
 * default new-diagram state (default theme, rough off, auto-update on).
 */
export const buildPayload = (code: string): string =>
  serializeState({
    code,
    mermaid: '{"theme":"default"}',
    updateDiagram: true,
    rough: false
  });
