import { toUint8Array } from 'js-base64';
import { inflate } from 'pako';
import { describe, expect, it } from 'vitest';
import { buildPayload, serializeState, type State } from './serde';

// Drift guard: the payload must stay round-trippable with the editor's decoder
// (src/lib/util/serde.ts `deserializeState`), i.e. `pako:` + url-safe base64 of
// the deflated JSON. If the editor's format ever changes, these break.

const decode = (payload: string): State => {
  expect(payload.startsWith('pako:')).toBe(true);
  const body = payload.slice('pako:'.length);
  // url-safe base64, no padding (matches js-base64 fromUint8Array(_, true)).
  expect(body).not.toMatch(/[+/=]/);
  return JSON.parse(inflate(toUint8Array(body), { to: 'string' })) as State;
};

describe('serializeState', () => {
  it('round-trips a State through the pako: format', () => {
    const state: State = {
      code: 'flowchart TD\n  A-->B',
      mermaid: '{"theme":"default"}',
      updateDiagram: true,
      rough: false
    };
    expect(decode(serializeState(state))).toEqual(state);
  });
});

describe('buildPayload', () => {
  it('wraps raw code in the editor default state', () => {
    const code = 'sequenceDiagram\n  Alice->>Bob: Hi';
    expect(decode(buildPayload(code))).toEqual({
      code,
      mermaid: '{"theme":"default"}',
      updateDiagram: true,
      rough: false
    });
  });
});
