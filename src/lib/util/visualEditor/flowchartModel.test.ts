import { beforeAll, describe, expect, it } from 'vitest';
import mermaid from 'mermaid';
import {
  getStyleProp,
  parseFlowchart,
  serializeFlowchart,
  setStyleProp,
  type FlowchartModel
} from './flowchartModel';

// Normalize a model for structural comparison: sort collections whose order is
// not semantically meaningful so round-trip differences in emission order do
// not cause false negatives. Edge order is preserved (it is significant).
const normalize = (model: FlowchartModel) => ({
  classDefs: [...model.classDefs]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ name: c.name, styles: [...c.styles].sort() })),
  direction: model.direction,
  edges: model.edges.map((e) => ({
    end: e.end,
    label: e.label,
    length: e.length,
    start: e.start,
    stroke: e.stroke,
    type: e.type
  })),
  nodes: [...model.nodes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((n) => ({
      classes: [...n.classes].sort(),
      id: n.id,
      label: n.label,
      shape: n.shape,
      styles: [...n.styles].sort(),
      subgraph: n.subgraph
    })),
  subgraphs: [...model.subgraphs]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => ({ direction: s.direction, id: s.id, parent: s.parent, title: s.title }))
});

const roundTrip = async (code: string) => {
  const first = await parseFlowchart(code);
  if (!first) {
    throw new Error(`should parse: ${code}`);
  }
  const serialized = serializeFlowchart(first);
  const second = await parseFlowchart(serialized);
  if (!second) {
    throw new Error(`should re-parse serialized:\n${serialized}`);
  }
  return { first, second, serialized };
};

describe('flowchart model round-trip', () => {
  beforeAll(async () => {
    mermaid.initialize({});
    // Prime built-in diagram registration.
    await mermaid.parse('flowchart TD\n A --> B');
  });

  it('preserves the starter diagram', async () => {
    const { first, second } = await roundTrip(`flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]`);
    expect(normalize(second)).toEqual(normalize(first));
  });

  it('preserves subgraph membership', async () => {
    const { first, second } = await roundTrip(`flowchart TD
    A --> B
    subgraph one [First Group]
      B --> C
      C --> D
    end
    subgraph two
      E
      F
    end
    C --> E`);
    expect(normalize(second)).toEqual(normalize(first));
    const e = second.nodes.find((n) => n.id === 'E');
    expect(e?.subgraph).toBe('two');
    const b = second.nodes.find((n) => n.id === 'B');
    expect(b?.subgraph).toBe('one');
  });

  it.each([
    ['rect', 'N[Square]'],
    ['rounded', 'N(Round)'],
    ['stadium', 'N([Stadium])'],
    ['subroutine', 'N[[Subroutine]]'],
    ['cylinder', 'N[(Database)]'],
    ['circle', 'N((Circle))'],
    ['doublecircle', 'N(((Double)))'],
    ['asymmetric', 'N>Flag]'],
    ['rhombus', 'N{Diamond}'],
    ['hexagon', 'N{{Hexagon}}'],
    ['parallelogram', 'N[/Para/]'],
    ['parallelogram_alt', 'N[\\Para\\]'],
    ['trapezoid', 'N[/Trap\\]'],
    ['trapezoid_alt', 'N[\\Trap/]']
  ])('preserves shape %s', async (shape, decl) => {
    const { second } = await roundTrip(`flowchart LR\n  A --> ${decl} --> B`);
    expect(second.nodes.find((n) => n.id === 'N')?.shape).toBe(shape);
  });

  it.each([
    ['arrow_point normal', 'A --> B', { type: 'arrow_point', stroke: 'normal', length: 1 }],
    ['arrow_open normal', 'A --- B', { type: 'arrow_open', stroke: 'normal', length: 1 }],
    ['arrow_circle', 'A --o B', { type: 'arrow_circle', stroke: 'normal', length: 1 }],
    ['arrow_cross', 'A --x B', { type: 'arrow_cross', stroke: 'normal', length: 1 }],
    ['thick', 'A ==> B', { type: 'arrow_point', stroke: 'thick', length: 1 }],
    ['dotted', 'A -.-> B', { type: 'arrow_point', stroke: 'dotted', length: 1 }],
    ['double point', 'A <--> B', { type: 'double_arrow_point', stroke: 'normal', length: 1 }],
    ['long', 'A ---> B', { type: 'arrow_point', stroke: 'normal', length: 2 }],
    ['extra long', 'A ----> B', { type: 'arrow_point', stroke: 'normal', length: 3 }]
  ])('preserves edge %s', async (_name, stmt, expected) => {
    const { second } = await roundTrip(`flowchart LR\n  ${stmt}`);
    const edge = second.edges[0];
    expect({ type: edge.type, stroke: edge.stroke, length: edge.length }).toEqual(expected);
  });

  it('preserves edge labels (pipe and inline forms)', async () => {
    const { second } = await roundTrip(`flowchart LR
    A -->|piped| B
    B -- inline --> C
    C -. dotted label .-> D`);
    expect(second.edges.map((e) => e.label)).toEqual(['piped', 'inline', 'dotted label']);
  });

  it('preserves styles, classDefs and class assignments', async () => {
    const { first, second } = await roundTrip(`flowchart TD
    A[One]:::big --> B[Two]
    C[Three]
    classDef big fill:#f96,stroke:#333,stroke-width:4px
    class B,C big
    style A fill:#bbf,stroke-width:2px`);
    expect(normalize(second)).toEqual(normalize(first));
    expect(second.nodes.find((n) => n.id === 'A')?.styles).toContain('fill:#bbf');
    expect(second.nodes.find((n) => n.id === 'B')?.classes).toContain('big');
    expect(second.classDefs.find((c) => c.name === 'big')?.styles).toContain('stroke-width:4px');
  });

  it('preserves labels needing quotes', async () => {
    const { second } = await roundTrip(`flowchart LR
    A["Label (with) parens & symbols"] --> B["a | b"]`);
    expect(second.nodes.find((n) => n.id === 'A')?.label).toBe('Label (with) parens & symbols');
    expect(second.nodes.find((n) => n.id === 'B')?.label).toBe('a | b');
  });

  it('preserves nested subgraphs and their direction', async () => {
    const { first, second } = await roundTrip(`flowchart TB
    subgraph outer [Outer]
      direction LR
      subgraph inner [Inner]
        X --> Y
      end
      Z
    end
    Y --> Z`);
    expect(normalize(second)).toEqual(normalize(first));
    expect(second.subgraphs.find((s) => s.id === 'inner')?.parent).toBe('outer');
    expect(second.subgraphs.find((s) => s.id === 'outer')?.direction).toBe('LR');
  });

  it('preserves frontmatter, directives and passthrough lines', async () => {
    const model = await parseFlowchart(`---
title: My Diagram
---
flowchart LR
    A --> B
    click A "https://example.com" "tooltip"`);
    if (!model) {
      throw new Error('should parse diagram with frontmatter');
    }
    const out = serializeFlowchart(model);
    expect(out).toContain('---\ntitle: My Diagram\n---');
    expect(out).toContain('click A "https://example.com" "tooltip"');
  });

  it('returns undefined for non-flowchart diagrams', async () => {
    expect(await parseFlowchart('sequenceDiagram\n A->>B: hi')).toBeUndefined();
    expect(await parseFlowchart('not a diagram at all')).toBeUndefined();
  });

  it('parses graph keyword as a flowchart', async () => {
    const model = await parseFlowchart('graph LR\n A-->B');
    if (!model) {
      throw new Error('should parse graph keyword');
    }
    expect(model.direction).toBe('LR');
  });
});

describe('style helpers', () => {
  it('reads properties', () => {
    expect(getStyleProp(['fill:#bbf', 'stroke-width:2px'], 'fill')).toBe('#bbf');
    expect(getStyleProp(['fill:#bbf'], 'stroke')).toBeUndefined();
  });

  it('sets, replaces and removes properties', () => {
    expect(setStyleProp([], 'fill', '#fff')).toEqual(['fill:#fff']);
    expect(setStyleProp(['fill:#000'], 'fill', '#fff')).toEqual(['fill:#fff']);
    expect(setStyleProp(['fill:#000', 'stroke:#111'], 'fill', undefined)).toEqual(['stroke:#111']);
    expect(setStyleProp(['fill:#000'], 'fill', '')).toEqual([]);
  });
});
