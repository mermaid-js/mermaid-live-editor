import type { State } from '$lib/types';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import {
  defaultState,
  inputState,
  loadState,
  replaceInputState,
  toggleDarkTheme,
  updateCode,
  updateCodeStore,
  updateConfig,
  verifyState
} from './state.svelte';

// Runs `body` inside an effect and reports how often the effect (re-)runs.
const countEffectRuns = (body: () => void): { runs: () => number; stop: () => void } => {
  let runs = 0;
  const stop = $effect.root(() => {
    $effect(() => {
      runs++;
      body();
    });
  });
  flushSync();
  return { runs: () => runs, stop };
};

const readStoredState = (): State =>
  JSON.parse(window.localStorage.getItem('codeStore') ?? '{}') as State;

describe('update functions called from effects', () => {
  // Effects that call an update function must not subscribe to the input
  // state the function reads, or unrelated state changes re-fire the effect
  // (and self-reads loop, e.g. the dark-theme effect in +layout.svelte).
  const cases: [string, () => void][] = [
    ['updateCodeStore', () => updateCodeStore({})],
    ['updateCode', () => updateCode('graph TD\n inside-effect')],
    ['updateConfig', () => updateConfig('{"theme":"default"}')],
    ['toggleDarkTheme', () => toggleDarkTheme(false)],
    ['replaceInputState', () => replaceInputState({ ...defaultState })],
    ['verifyState', () => verifyState()],
    ['loadState', () => loadState('')]
  ];

  it.each(cases)('%s does not make the calling effect track input state', (_name, call) => {
    const counter = countEffectRuns(call);
    try {
      expect(counter.runs()).toBe(1);
      updateCode('graph TD\n external-change');
      updateConfig('{"theme":"forest"}');
      updateCodeStore({ pan: { x: 1, y: 2 } });
      flushSync();
      expect(counter.runs()).toBe(1);
    } finally {
      counter.stop();
    }
  });
});

describe('update functions persist input state', () => {
  it('updateCode writes the new code to localStorage', () => {
    updateCode('graph TD\n persisted-by-test');
    expect(readStoredState().code).toBe('graph TD\n persisted-by-test');
  });

  it('updateCodeStore merges partial state and persists it', () => {
    updateCodeStore({ rough: true });
    expect(inputState.rough).toBe(true);
    expect(readStoredState().rough).toBe(true);
  });

  it('replaceInputState drops keys absent from the next state and persists', () => {
    updateCodeStore({ pan: { x: 1, y: 2 } });
    expect(inputState.pan).toEqual({ x: 1, y: 2 });
    replaceInputState({ ...defaultState });
    expect(inputState.pan).toBeUndefined();
    expect(readStoredState().pan).toBeUndefined();
    expect(readStoredState().code).toBe(defaultState.code);
  });

  it('verifyState forces panZoom back on', () => {
    updateCodeStore({ panZoom: false });
    verifyState();
    expect(inputState.panZoom).toBe(true);
    expect(readStoredState().panZoom).toBe(true);
  });
});
