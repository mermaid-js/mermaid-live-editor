import { describe, expect, it } from 'vitest';
import { denormalizeViewportPan, normalizeViewport } from './panZoom';

describe('normalized pan and zoom', () => {
  it('maps the same diagram-space center between differently sized panes', () => {
    const viewport = normalizeViewport({ x: -100, y: 50 }, 2, {
      height: 400,
      realZoom: 2,
      width: 600
    });

    expect(viewport).toEqual({ center: { x: 200, y: 75 }, zoom: 2 });
    expect(denormalizeViewportPan(viewport, { height: 800, realZoom: 4, width: 1200 })).toEqual({
      x: -200,
      y: 100
    });
  });
});
