import { describe, expect, it } from 'vitest';
import { serializeSvg } from './svgExport';

const createSvg = (markup: string): Element => {
  const container = document.createElement('div');
  container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`;
  const svg = container.firstElementChild;
  if (!svg) {
    throw new Error('Failed to create SVG');
  }
  return svg;
};

const parseAsXml = (markup: string) => new DOMParser().parseFromString(markup, 'image/svg+xml');

describe('serializeSvg', () => {
  it('produces valid XML when the diagram contains non-breaking spaces', () => {
    // Mermaid turns `#nbsp;` in labels into U+00A0, which `outerHTML` escapes as `&nbsp;`.
    const svg = createSvg('<text>{<tspan>test</tspan> }</text>');
    expect(svg.outerHTML).toContain('&nbsp;');

    const serialized = serializeSvg(svg);

    expect(serialized).not.toContain('&nbsp;');
    const document = parseAsXml(serialized);
    expect(document.querySelector('parsererror')).toBeNull();
    expect(document.querySelector('text')?.textContent).toBe('{test }');
  });

  it('closes void HTML elements inside foreignObject', () => {
    const svg = createSvg(
      '<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">a<br>b<img src="x.png"></div></foreignObject>'
    );

    const serialized = serializeSvg(svg);

    expect(serialized).toContain('<br/>');
    expect(serialized).toMatch(/<img [^>]*\/>/);
    expect(parseAsXml(serialized).querySelector('parsererror')).toBeNull();
  });
});
