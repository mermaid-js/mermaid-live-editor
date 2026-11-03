import type { State } from '$lib/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parse } from './mermaid';
import {
  inputState,
  reportRenderTime,
  updateCode,
  updateCodeStore,
  updateConfig,
  validatedState
} from './state.svelte';

// Validation is the expensive step (mermaid.parse plus the render it
// triggers); faking it lets these tests observe *when* it runs. An empty
// diagram type keeps the managed-theme sync out of the way.
vi.mock('./mermaid', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./mermaid')>();
  return { ...actual, parse: vi.fn() };
});

const parseMock = vi.mocked(parse);
const parsed = { diagramType: '' } as Awaited<ReturnType<typeof parse>>;
const readStoredState = (): State =>
  JSON.parse(window.localStorage.getItem('codeStore') ?? '{}') as State;

/** Makes the next parse take `ms` of (fake) time. */
const slowParseOnce = (ms: number) =>
  parseMock.mockImplementationOnce(
    () => new Promise((resolve) => setTimeout(() => resolve(parsed), ms))
  );

beforeEach(() => {
  vi.useFakeTimers();
  parseMock.mockReset();
  parseMock.mockResolvedValue(parsed);
  updateCode('graph TD\n  Baseline');
  updateConfig('{}');
  reportRenderTime(0);
  parseMock.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('keystroke updates while the last validate-and-render cycle was fast', () => {
  it('validate immediately', () => {
    reportRenderTime(50);

    updateCode('graph TD\n  A --> B', { debounce: true });

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(parseMock).toHaveBeenCalledWith('graph TD\n  A --> B');
  });

  it('treat exactly 100ms as still fast', () => {
    reportRenderTime(100);

    updateCode('graph TD\n  A --> B', { debounce: true });

    expect(parseMock).toHaveBeenCalledTimes(1);
  });

  it('count the parse time towards the cycle, not just the render', async () => {
    slowParseOnce(60);
    updateCode('graph TD\n  Warm-up');
    await vi.advanceTimersByTimeAsync(60);
    reportRenderTime(60);
    parseMock.mockClear();

    updateCode('graph TD\n  A --> B', { debounce: true });

    expect(parseMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(300);
    expect(parseMock).toHaveBeenCalledTimes(1);
  });
});

describe('keystroke updates once the last validate-and-render cycle was slow', () => {
  beforeEach(() => {
    reportRenderTime(200);
  });

  it('apply and persist the code at once but defer validation', async () => {
    updateCode('graph TD\n  A --> B', { debounce: true });

    expect(inputState.code).toBe('graph TD\n  A --> B');
    expect(readStoredState().code).toBe('graph TD\n  A --> B');
    expect(parseMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(parseMock).toHaveBeenCalledWith('graph TD\n  A --> B');
    expect(validatedState.current.code).toBe('graph TD\n  A --> B');
  });

  it('collapse a burst into one validation of the last value', async () => {
    updateCode('graph TD\n  A', { debounce: true });
    await vi.advanceTimersByTimeAsync(100);
    updateCode('graph TD\n  A -', { debounce: true });
    await vi.advanceTimersByTimeAsync(100);
    updateCode('graph TD\n  A --> B', { debounce: true });
    await vi.advanceTimersByTimeAsync(299);

    expect(parseMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(parseMock).toHaveBeenCalledWith('graph TD\n  A --> B');
  });

  it('are dropped when an immediate update validates first', async () => {
    updateCode('graph TD\n  Typed', { debounce: true });
    updateCodeStore({ rough: true });

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(parseMock).toHaveBeenCalledWith('graph TD\n  Typed');

    await vi.advanceTimersByTimeAsync(300);

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(validatedState.current.code).toBe('graph TD\n  Typed');
    expect(validatedState.current.rough).toBe(true);
  });

  it('defer config changes the same way', async () => {
    updateConfig('{"theme":"forest"}', { debounce: true });

    expect(inputState.mermaid).toBe('{"theme":"forest"}');
    expect(readStoredState().mermaid).toBe('{"theme":"forest"}');
    expect(parseMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(validatedState.current.mermaid).toBe('{"theme":"forest"}');
  });

  it('validate immediately again once a cycle turns out fast', async () => {
    updateCode('graph TD\n  Slow', { debounce: true });
    await vi.advanceTimersByTimeAsync(300);
    expect(parseMock).toHaveBeenCalledTimes(1);
    reportRenderTime(20);

    updateCode('graph TD\n  Fast', { debounce: true });

    expect(parseMock).toHaveBeenCalledTimes(2);
    expect(parseMock).toHaveBeenLastCalledWith('graph TD\n  Fast');
  });

  it('drop a validation that finishes after the code changed again', async () => {
    // A stale publish would make the editors overwrite what the user has
    // typed since; the pending debounced validation covers the newer code.
    slowParseOnce(200);
    updateCode('graph TD\n  Slow', { debounce: true });
    await vi.advanceTimersByTimeAsync(300);
    updateCode('graph TD\n  Slow --> More', { debounce: true });
    await vi.advanceTimersByTimeAsync(250);

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(validatedState.current.code).toBe('graph TD\n  Baseline');

    await vi.advanceTimersByTimeAsync(100);

    expect(parseMock).toHaveBeenCalledTimes(2);
    expect(validatedState.current.code).toBe('graph TD\n  Slow --> More');
  });
});

describe('stale validations', () => {
  it('a slower, older validation cannot overwrite a newer one', async () => {
    slowParseOnce(500);
    updateCode('graph TD\n  Old');
    updateCode('graph TD\n  New');

    await vi.advanceTimersByTimeAsync(600);

    expect(parseMock).toHaveBeenCalledTimes(2);
    expect(validatedState.current.code).toBe('graph TD\n  New');
  });
});
