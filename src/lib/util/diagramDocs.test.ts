import { describe, expect, it } from 'vitest';
import { getDiagramDocumentationUrl } from './diagramDocs';

const mermaidAiDocs = 'https://mermaid.ai/open-source';
const mermaidJsDocs = 'https://mermaid.js.org';

describe('getDiagramDocumentationUrl', () => {
  it('joins diagram paths onto mermaid.js.org when that is the docs base', () => {
    expect(getDiagramDocumentationUrl('flowchart', 'code', mermaidJsDocs)).toBe(
      'https://mermaid.js.org/syntax/flowchart.html'
    );
  });

  it('joins diagram paths onto mermaid.ai/open-source when that is the docs base', () => {
    expect(getDiagramDocumentationUrl('flowchart', 'code', mermaidAiDocs)).toBe(
      'https://mermaid.ai/open-source/syntax/flowchart.html'
    );
  });

  it('keeps the /open-source prefix when the docs base has a trailing slash', () => {
    expect(getDiagramDocumentationUrl('flowchart', 'code', `${mermaidAiDocs}/`)).toBe(
      'https://mermaid.ai/open-source/syntax/flowchart.html'
    );
  });

  it('uses mermaid.ai/open-source when the env base is the mermaid.ai origin', () => {
    expect(getDiagramDocumentationUrl('flowchart', 'code', 'https://mermaid.ai')).toBe(
      'https://mermaid.ai/open-source/syntax/flowchart.html'
    );
  });

  it('uses the diagram-specific config anchor when editor mode is config', () => {
    expect(getDiagramDocumentationUrl('flowchart', 'config', mermaidAiDocs)).toBe(
      'https://mermaid.ai/open-source/syntax/flowchart.html#configuration'
    );
  });

  it('falls back to the code docs page when a diagram has no config URL', () => {
    expect(getDiagramDocumentationUrl('stateDiagram', 'config', mermaidAiDocs)).toBe(
      'https://mermaid.ai/open-source/syntax/stateDiagram.html'
    );
  });

  it('standardizes flowchart variants onto the flowchart docs page', () => {
    expect(getDiagramDocumentationUrl('flowchart-elk', 'code', mermaidJsDocs)).toBe(
      'https://mermaid.js.org/syntax/flowchart.html'
    );
  });

  it('links class diagrams to the class diagram page', () => {
    expect(getDiagramDocumentationUrl('classDiagram', 'config', mermaidJsDocs)).toBe(
      'https://mermaid.js.org/syntax/classDiagram.html#configuration'
    );
  });

  it('returns the docs base when the diagram type is unknown', () => {
    expect(getDiagramDocumentationUrl(undefined, 'code', mermaidAiDocs)).toBe(mermaidAiDocs);
    expect(getDiagramDocumentationUrl('not-a-diagram', 'code', mermaidAiDocs)).toBe(mermaidAiDocs);
  });
});
