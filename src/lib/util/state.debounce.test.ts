import type { State } from '$lib/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parse } from './mermaid';
import {
  inputState,
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

beforeEach(() => {
  vi.useFakeTimers();
  parseMock.mockReset();
  parseMock.mockResolvedValue(parsed);
  updateCode('graph TD\n  Baseline');
  updateConfig('{}');
  parseMock.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('debounced updates', () => {
  it('updateCode applies and persists the code at once but defers validation', async () => {
    updateCode('graph TD\n  A --> B', { debounce: true });

    expect(inputState.code).toBe('graph TD\n  A --> B');
    expect(readStoredState().code).toBe('graph TD\n  A --> B');
    expect(parseMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(parseMock).toHaveBeenCalledWith('graph TD\n  A --> B');
    expect(validatedState.current.code).toBe('graph TD\n  A --> B');
  });

  it('collapses a burst of debounced updates into one validation of the last value', async () => {
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

  it('an immediate update validates right away and drops the pending debounced one', async () => {
    updateCode('graph TD\n  Typed', { debounce: true });
    updateCodeStore({ rough: true });

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(parseMock).toHaveBeenCalledWith('graph TD\n  Typed');

    await vi.advanceTimersByTimeAsync(300);

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(validatedState.current.code).toBe('graph TD\n  Typed');
    expect(validatedState.current.rough).toBe(true);
  });

  it('updateConfig can defer validation the same way', async () => {
    updateConfig('{"theme":"forest"}', { debounce: true });

    expect(inputState.mermaid).toBe('{"theme":"forest"}');
    expect(readStoredState().mermaid).toBe('{"theme":"forest"}');
    expect(parseMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);

    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(validatedState.current.mermaid).toBe('{"theme":"forest"}');
  });

  it('a slower, older validation cannot overwrite a newer one', async () => {
    parseMock.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(parsed), 500))
    );
    updateCode('graph TD\n  Old');
    updateCode('graph TD\n  New');

    await vi.advanceTimersByTimeAsync(600);

    expect(parseMock).toHaveBeenCalledTimes(2);
    expect(validatedState.current.code).toBe('graph TD\n  New');
  });

  it('drops a validation that finishes after the code changed again', async () => {
    // A stale publish would make the editors overwrite what the user has
    // typed since; the pending debounced validation covers the newer code.
    parseMock.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(parsed), 200))
    );
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
