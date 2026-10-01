import { detectDiagramType } from '@mermaid-js/syntax-metadata';
import { describe, expect, it } from 'vitest';
import { getCompletions, snippetToPlainText } from './mermaidCompletions';

const complete = (text: string) => getCompletions(text, text.length);

describe('detectDiagramType', () => {
  it.each([
    ['', undefined],
    ['flowchart TD\n\tA --> B', 'flowchart'],
    ['graph LR\n\tA --> B', 'flowchart'],
    ['sequenceDiagram\n\tA->>B: hi', 'sequenceDiagram'],
    ['classDiagram-v2\n\tclass Animal', 'classDiagram'],
    ['stateDiagram-v2\n\t[*] --> Still', 'stateDiagram'],
    ['erDiagram\n\tCUSTOMER ||--o{ ORDER : places', 'erDiagram'],
    ['gitGraph\n\tcommit', 'gitGraph'],
    ['mindmap\n\troot((Root))', 'mindmap'],
    ['hello world', undefined]
  ])('detects %j as %s', (text, expected) => {
    expect(detectDiagramType(text)).toBe(expected);
  });

  it('skips frontmatter and config directives', () => {
    expect(detectDiagramType('---\ntitle: demo\n---\nsequenceDiagram\n\tA->>B: hi')).toBe(
      'sequenceDiagram'
    );
    expect(detectDiagramType('%%{init: {"theme": "dark"}}%%\nstateDiagram-v2')).toBe(
      'stateDiagram'
    );
    expect(detectDiagramType('%% a comment\nflowchart TD')).toBe('flowchart');
  });
});

describe('getCompletions', () => {
  it('offers diagram declaration snippets in an empty document', () => {
    const { suggestions } = complete('');
    const labels = suggestions.map((suggestion) => suggestion.label);
    expect(labels).toContain('flowchart');
    expect(labels).toContain('sequenceDiagram');
    expect(labels).toContain('zenuml');
    const flowchart = suggestions.find((suggestion) => suggestion.label === 'flowchart');
    expect(flowchart?.snippet).toBe(true);
    expect(flowchart?.insertText).toContain('$');
  });

  it('replaces a partially typed declaration', () => {
    const { from, to } = complete('flow');
    expect(from).toBe(0);
    expect(to).toBe(4);
  });

  it('offers keywords and snippets once a diagram is declared', () => {
    const { suggestions } = complete('sequenceDiagram\n\t');
    const labels = suggestions.map((suggestion) => suggestion.label);
    expect(labels).toContain('participant');
    expect(labels).toContain('alt');
    expect(labels).not.toContain('flowchart');
    const alt = suggestions.find((suggestion) => suggestion.label === 'alt block');
    expect(alt?.snippet).toBe(true);
    expect(alt?.insertText).toContain('else');
  });

  it('extracts flowchart node ids with their labels', () => {
    const { suggestions } = complete('flowchart TD\n\tA[Start] --> B(End)\n\t');
    const identifiers = suggestions.filter((suggestion) => suggestion.kind === 'identifier');
    expect(identifiers.map((suggestion) => suggestion.label)).toEqual(['A', 'B']);
    expect(identifiers[0].detail).toBe('Start');
    expect(identifiers[1].detail).toBe('End');
  });

  it('extracts participants, classes, states and entities', () => {
    const sequence = complete('sequenceDiagram\n\tparticipant A as Alice\n\tA->>B: hi\n\t');
    expect(sequence.suggestions.map((suggestion) => suggestion.label)).toEqual(
      expect.arrayContaining(['A', 'B'])
    );

    const classDiagram = complete('classDiagram\n\tclass Animal\n\tDog --|> Animal\n\t');
    expect(classDiagram.suggestions.map((suggestion) => suggestion.label)).toEqual(
      expect.arrayContaining(['Animal', 'Dog'])
    );

    const stateDiagram = complete('stateDiagram-v2\n\t[*] --> Still\n\tStill --> Moving\n\t');
    const stateIdentifiers = stateDiagram.suggestions
      .filter((suggestion) => suggestion.kind === 'identifier')
      .map((suggestion) => suggestion.label);
    expect(stateIdentifiers).toEqual(expect.arrayContaining(['Still', 'Moving']));
    expect(stateIdentifiers).not.toContain('[*]');

    const erDiagram = complete('erDiagram\n\tCUSTOMER ||--o{ ORDER : places\n\t');
    expect(erDiagram.suggestions.map((suggestion) => suggestion.label)).toEqual(
      expect.arrayContaining(['CUSTOMER', 'ORDER'])
    );
  });

  it('suggests operators with a range covering the typed operator', () => {
    const text = 'flowchart TD\n\tA--';
    const { from, suggestions, to } = complete(text);
    expect(from).toBe(text.length - 2);
    expect(to).toBe(text.length);
    expect(suggestions.map((suggestion) => suggestion.label)).toContain('-->');
  });

  it('does not suggest inside labels, strings, comments or message text', () => {
    expect(complete('flowchart TD\n\tA[Hel').suggestions).toHaveLength(0);
    expect(complete('flowchart TD\n\tA["Hel').suggestions).toHaveLength(0);
    expect(complete('flowchart TD\n\t%% Hel').suggestions).toHaveLength(0);
    expect(complete('flowchart TD\n\tA -->|yes').suggestions).toHaveLength(0);
    expect(complete('sequenceDiagram\n\tA->>B: Hel').suggestions).toHaveLength(0);
    expect(complete('gantt\n\ttitle My ').suggestions).toHaveLength(0);
    expect(complete('flowchart TD\n\t%%{init: {"theme": "dark"}').suggestions).toHaveLength(0);
  });

  it('allows text after a colon in class diagrams', () => {
    const { suggestions } = complete('classDiagram\n\tAnimal : ');
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('links suggestions to their syntax reference', () => {
    const { suggestions } = complete('flowchart TD\n\tsu');
    const subgraph = suggestions.find((suggestion) => suggestion.label === 'subgraph');
    expect(subgraph?.documentation).toContain('mermaid.js.org/syntax/flowchart.html');
  });
});

describe('snippetToPlainText', () => {
  it.each([
    ['flowchart ${1|TD,LR|}', 'flowchart TD'],
    ['participant ${1:A} as ${2:Alice}', 'participant A as Alice'],
    ['subgraph ${1:title}\n\t${2:A} --> ${3:B}\nend', 'subgraph title\n\tA --> B\nend'],
    ['bar [${1:1, 2, 3}]$0', 'bar [1, 2, 3]']
  ])('converts %j to %j', (snippet, expected) => {
    expect(snippetToPlainText(snippet)).toBe(expected);
  });
});
