import { beforeEach, describe, expect, it } from 'vitest';
import { persisted, readJSON, writeJSON } from './persist.svelte';

beforeEach(() => {
  window.localStorage.clear();
});

describe('readJSON', () => {
  it('returns the fallback when the key is missing', () => {
    expect(readJSON('missing', 'fallback')).toBe('fallback');
  });

  it('returns the parsed value when present', () => {
    window.localStorage.setItem('key', '{"a":1}');
    expect(readJSON<{ a: number }>('key', { a: 0 })).toEqual({ a: 1 });
  });

  it('returns the fallback when the stored value is corrupt', () => {
    window.localStorage.setItem('corrupt', '{oops');
    expect(readJSON('corrupt', 'fallback')).toBe('fallback');
    // The previous persistence layer could write the literal string "undefined".
    window.localStorage.setItem('legacy', 'undefined');
    expect(readJSON('legacy', 'fallback')).toBe('fallback');
  });

  it('returns the fallback when the stored value parses to null', () => {
    // The pre-runes persistence layer treated a stored null as absent.
    window.localStorage.setItem('legacy-null', 'null');
    expect(readJSON('legacy-null', 'fallback')).toBe('fallback');
  });
});

describe('writeJSON', () => {
  it('round-trips values through localStorage as JSON', () => {
    writeJSON('key', { nested: { value: 2 } });
    expect(window.localStorage.getItem('key')).toBe('{"nested":{"value":2}}');
    expect(readJSON('key', {})).toEqual({ nested: { value: 2 } });
  });
});

describe('persisted', () => {
  it('initialises from storage when a value exists', () => {
    window.localStorage.setItem('counter', '5');
    const counter = persisted('counter', 0);
    expect(counter.value).toBe(5);
  });

  it('uses the initial value when storage is empty, without writing it', () => {
    const counter = persisted('counter', 7);
    expect(counter.value).toBe(7);
    expect(window.localStorage.getItem('counter')).toBeNull();
  });

  it('persists on assignment and exposes the new value', () => {
    const counter = persisted('counter', 0);
    counter.value = 42;
    expect(counter.value).toBe(42);
    expect(window.localStorage.getItem('counter')).toBe('42');
  });

  it('uses the initial value when storage holds a literal null', () => {
    window.localStorage.setItem('settings', 'null');
    const settings = persisted('settings', { theme: 'default' });
    expect(settings.value).toEqual({ theme: 'default' });
  });
});
