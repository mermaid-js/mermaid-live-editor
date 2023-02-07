import { describe, it, expect } from 'vitest';
import { detectType } from './stats';
describe('diagram detection', () => {
  it('should detect diagrams correctly', () => {
    expect(
      detectType(`%%{{
			graph`)
    ).toBe('graph');
    expect(detectType(`gitGraph`)).toBe('gitGraph');
    expect(
      detectType(`%%{{


			flowChart
			graph`)
    ).toBe('flowChart');
    expect(detectType(`loki -> thor`)).toBe(undefined);
  });
});
