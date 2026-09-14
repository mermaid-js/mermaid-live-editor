import { describe, expect, it } from 'vitest';
import { darkVariantOf, getDefaultTheme, getSampleDiagrams, isManagedTheme } from './mermaid';

describe('getDefaultTheme', () => {
  it.each([
    ['flowchart-v2', 'redux-color'],
    ['flowchart-elk', 'redux-color'],
    ['classDiagram', 'redux-color'],
    ['stateDiagram', 'redux-color'],
    ['sequence', 'redux-color'],
    ['pie', 'default'],
    ['xychart', 'default'],
    ['railroadAbnf', 'default'],
    ['wardley', 'default']
  ])('resolves %s to its config section default (%s)', (diagramType, theme) => {
    expect(getDefaultTheme(diagramType)).toBe(theme);
  });
});

describe('darkVariantOf', () => {
  it.each([
    ['redux-color', 'redux-dark-color'],
    ['redux', 'redux-dark'],
    ['redux-dark-color', 'redux-dark-color'],
    ['default', 'dark'],
    ['forest', 'dark']
  ])('%s → %s', (theme, dark) => {
    expect(darkVariantOf(theme)).toBe(dark);
  });
});

describe('isManagedTheme', () => {
  it('treats a missing theme and every derivable default as editor-managed', () => {
    for (const theme of [undefined, 'default', 'dark', 'redux-color', 'redux-dark-color']) {
      expect(isManagedTheme(theme), String(theme)).toBe(true);
    }
  });

  it('treats any other theme as the user’s choice', () => {
    for (const theme of ['forest', 'neutral', 'neo', 'base', 'redux', 42]) {
      expect(isManagedTheme(theme), String(theme)).toBe(false);
    }
  });
});

describe('getSampleDiagrams', () => {
  const samples = getSampleDiagrams();

  it('should return at least one example per diagram', () => {
    expect(Object.keys(samples).length).toBeGreaterThan(0);
    for (const [name, examples] of Object.entries(samples)) {
      expect(examples.length, `${name} should have at least one example`).toBeGreaterThan(0);
      for (const example of examples) {
        expect(example.title, `${name} has an example without a title`).toBeTruthy();
        expect(example.code, `${name} example "${example.title}" has no code`).toBeTruthy();
      }
    }
  });

  it('should list the default example first', () => {
    for (const [name, examples] of Object.entries(samples)) {
      expect(examples[0].isDefault, `${name} should have its default example first`).toBe(true);
    }
  });
});
