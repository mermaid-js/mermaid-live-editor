import { describe, expect, it } from 'vitest';
import { getSampleDiagrams } from './mermaid';

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
