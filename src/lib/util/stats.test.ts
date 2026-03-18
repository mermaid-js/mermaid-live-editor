import { beforeEach, describe, expect, it } from 'vitest';
import { getAnalyticsSafeUrl } from './stats';

describe('getAnalyticsUrl', () => {
  beforeEach(() => {
    // Reset location to a clean state before each test
    window.history.replaceState(null, '', '/');
  });

  it('should return origin and pathname for a simple URL', () => {
    window.history.replaceState(null, '', '/edit');
    const url = getAnalyticsSafeUrl();
    expect(url).toBe(`${window.location.origin}/edit`);
  });

  it('should include search/query params (UTM parameters)', () => {
    window.history.replaceState(null, '', '/edit?utm_source=github&utm_medium=docs');
    const url = getAnalyticsSafeUrl();
    expect(url).toBe(`${window.location.origin}/edit?utm_source=github&utm_medium=docs`);
  });

  it('should never include the hash', () => {
    window.history.replaceState(null, '', '/edit#pako:someDiagramData');
    // replaceState doesn't set hash, so set it via location
    window.location.hash = '#pako:someDiagramData';
    const url = getAnalyticsSafeUrl();
    expect(url).not.toContain('#');
    expect(url).not.toContain('pako:');
    expect(url).toBe(`${window.location.origin}/edit`);
  });

  it('should include search params but exclude hash when both are present', () => {
    window.history.replaceState(null, '', '/edit?utm_campaign=launch');
    window.location.hash = '#pako:diagramDataHere';
    const url = getAnalyticsSafeUrl();
    expect(url).not.toContain('#');
    expect(url).not.toContain('pako:');
    expect(url).toContain('utm_campaign=launch');
    expect(url).toBe(`${window.location.origin}/edit?utm_campaign=launch`);
  });

  it('should return just origin for root path with no params', () => {
    window.history.replaceState(null, '', '/');
    const url = getAnalyticsSafeUrl();
    expect(url).toBe(`${window.location.origin}/`);
  });
});
