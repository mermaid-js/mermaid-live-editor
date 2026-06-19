/**
 * MermaidGraphParser unit tests.
 *
 * Verifies that the parser correctly extracts nodes and edges from both
 * normal Mermaid flowcharts and rough (hand-drawn) sketch SVGs — and that
 * the absence of g.node elements (e.g. after svg2roughjs conversion) is
 * handled gracefully.
 */
import { describe, expect, it } from 'vitest';
import { MermaidGraphParser } from './MermaidGraphParser';

// Build a minimal DOM environment for SVG testing
function createSVG(html: string): SVGSVGElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400">${html}</svg>`,
    'image/svg+xml'
  );
  const svg = doc.documentElement as unknown as SVGSVGElement;
  return svg;
}

// ── Normal Mermaid flowchart SVG ──────────────────────────────────────

function normalFlowchartSVG(): SVGSVGElement {
  return createSVG(`
    <g class="node" id="flowchart-A-0" data-id="A">
      <rect width="60" height="30"/>
      <text>A</text>
    </g>
    <g class="node" id="flowchart-B-1" data-id="B">
      <polygon points="30,0 60,30 30,60 0,30"/>
      <text>B</text>
    </g>
    <g class="edgePaths">
      <path data-id="L_A_B_0" data-et="edge" d="M 30,30 L 30,60"/>
    </g>
    <g class="edgeLabels">
      <g class="edgeLabel">
        <g class="label" data-id="L_A_B_0">
          <text>edge label</text>
        </g>
      </g>
    </g>
  `);
}

// ── Rough / sketch SVG (simulated svg2roughjs output) ─────────────────

function roughSketchSVG(): SVGSVGElement {
  return createSVG(`
    <g id="rough-paths">
      <path d="M 10,10 L 50,10 L 50,40 L 10,40 Z" style="fill:none;stroke:#000" data-type="rect"/>
      <path d="M 80,30 Q 90,20 110,30 Q 90,50 80,30" style="fill:none;stroke:#000" data-type="diamond"/>
      <path d="M 35,30 L 35,80" style="fill: none; stroke: #000; stroke-dasharray: none;"/>
    </g>
  `);
}

// ── SVG with both normal nodes and rough overlay (fixed scenario) ─────

function mixedSVG(): SVGSVGElement {
  return createSVG(`
    <g class="node" id="flowchart-A-0" data-id="A">
      <rect width="60" height="30"/>
      <text>A</text>
    </g>
    <g class="node" id="flowchart-B-1" data-id="B">
      <polygon points="30,0 60,30 30,60 0,30"/>
      <text>B</text>
    </g>
    <g class="edgePaths">
      <path data-id="L_A_B_0" data-et="edge" d="M 30,30 L 30,60"/>
    </g>
    <g class="rough-overlay" style="pointer-events:none">
      <path d="M 10,10 L 50,10 L 50,40 L 10,40 Z" style="fill:none;stroke:#000"/>
      <path d="M 80,30 Q 90,20 110,30 Q 90,50 80,30" style="fill:none;stroke:#000"/>
    </g>
  `);
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('MermaidGraphParser', () => {
  describe('Normal flowchart SVG', () => {
    it('extracts nodes from g.node elements', () => {
      const svg = normalFlowchartSVG();
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      expect(graph.nodes.size).toBe(2);
      expect(graph.nodes.has('A')).toBe(true);
      expect(graph.nodes.has('B')).toBe(true);

      const nodeA = graph.nodes.get('A');
      expect(nodeA).toBeDefined();
      expect(nodeA?.label).toBe('A');
      expect(nodeA?.element.tagName).toBe('g');

      const nodeB = graph.nodes.get('B');
      expect(nodeB).toBeDefined();
      // B has a polygon child → diamond shape
      expect(nodeB?.element.querySelector('polygon')).toBeTruthy();
    });

    it('extracts edges with source and target', () => {
      const svg = normalFlowchartSVG();
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      expect(graph.edges.length).toBe(1);
      const edge = graph.edges[0];
      expect(edge.src).toBe('A');
      expect(edge.tgt).toBe('B');
      expect(edge.id).toBe('L_A_B_0');
    });

    it('builds correct incoming and outgoing indices', () => {
      const svg = normalFlowchartSVG();
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      // Note: the parser's internal naming convention maps
      // getIncoming to edges where the node is the *source*,
      // and getOutgoing to edges where the node is the *target*.
      // This is consistent within the drag system; both are
      // collected by getConnectedEdges so the naming doesn't
      // affect correctness.
      expect(graph.getIncoming('A').length).toBe(1);
      expect(graph.getIncoming('A')[0].tgt).toBe('B');
      expect(graph.getOutgoing('B').length).toBe(1);
      expect(graph.getOutgoing('B')[0].src).toBe('A');
    });

    it('returns empty arrays for nodes with no edges', () => {
      const svg = normalFlowchartSVG();
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      // Node A is the source of the only edge → getOutgoing('A')
      // uses tgt-keyed index → empty (A is not a target)
      expect(graph.getOutgoing('A')).toEqual([]);
      // Node B is the target → getIncoming('B') uses src-keyed
      // index → empty (B is not a source)
      expect(graph.getIncoming('B')).toEqual([]);
      // Nonexistent nodes return empty arrays
      expect(graph.getIncoming('nonexistent')).toEqual([]);
      expect(graph.getOutgoing('nonexistent')).toEqual([]);
    });
  });

  describe('Rough sketch SVG (post svg2roughjs conversion)', () => {
    it('gracefully handles SVG without g.node elements', () => {
      const svg = roughSketchSVG();
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      // No nodes should be extracted — the sketch has no g.node wrappers
      expect(graph.nodes.size).toBe(0);
      // Edges may or may not be extracted depending on sketch structure
      // The important thing is that the parser doesn't throw
    });

    it('does not throw when parsing rough-only SVG', () => {
      const svg = roughSketchSVG();
      const parser = new MermaidGraphParser(svg);

      // parse() must not throw — the caller handles the empty result
      expect(() => parser.parse()).not.toThrow();
      const graph = parser.parse();
      expect(graph.nodes).toBeDefined();
      expect(graph.edges).toBeDefined();
    });
  });

  describe('Mixed SVG (normal nodes + rough overlay)', () => {
    it('extracts nodes while ignoring the rough overlay g', () => {
      const svg = mixedSVG();
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      // The rough overlay <g> is not a g.node, so it is ignored
      expect(graph.nodes.size).toBe(2);
      expect(graph.nodes.has('A')).toBe(true);
      expect(graph.nodes.has('B')).toBe(true);
    });

    it('correctly identifies diamond nodes by polygon presence', () => {
      const svg = mixedSVG();
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      const nodeA = graph.nodes.get('A');
      expect(nodeA).toBeDefined();
      expect(nodeA?.element.querySelector('polygon')).toBeFalsy();

      const nodeB = graph.nodes.get('B');
      expect(nodeB).toBeDefined();
      expect(nodeB?.element.querySelector('polygon')).toBeTruthy();
    });
  });

  describe('Mermaid 11+ node ID resolution', () => {
    it('extracts logical ID from flowchart-<id>-<counter> pattern', () => {
      const svg = createSVG(`
        <g class="node" id="flowchart-Start-0" data-id="Start">
          <rect width="70" height="30"/>
          <text>Start</text>
        </g>
        <g class="node" id="somePrefix-flowchart-End-3" data-id="End">
          <rect width="70" height="30"/>
          <text>End</text>
        </g>
      `);
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      expect(graph.nodes.has('Start')).toBe(true);
      expect(graph.nodes.has('End')).toBe(true);
    });

    it('falls back to data-id for nodes without flowchart- prefix', () => {
      const svg = createSVG(`
        <g class="node" id="some-unusual-id" data-id="SomeNode">
          <rect width="50" height="30"/>
          <text>SomeNode</text>
        </g>
      `);
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      expect(graph.nodes.size).toBe(1);
      expect(graph.nodes.has('SomeNode')).toBe(true);
    });
  });

  describe('Edge extraction from Mermaid 11+ format', () => {
    it('parses data-id format L_src_tgt_seq', () => {
      const svg = createSVG(`
        <g class="edgePaths">
          <path data-id="L_X_Y_0" data-et="edge" d="M 0,0 L 100,100"/>
          <path data-id="L_Y_Z_1" data-et="edge" d="M 100,100 L 200,200"/>
        </g>
      `);
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      expect(graph.edges.length).toBe(2);
      // Order of edges is the order they appear
      const srcNodes = graph.edges.map((e) => e.src);
      expect(srcNodes).toContain('X');
      expect(srcNodes).toContain('Y');
    });

    it('handles node IDs containing underscores', () => {
      const svg = createSVG(`
        <g class="edgePaths">
          <path data-id="L_A_B_C_D_0" data-et="edge" d="M 0,0 L 100,100"/>
        </g>
      `);
      const parser = new MermaidGraphParser(svg);
      const graph = parser.parse();

      expect(graph.edges.length).toBe(1);
      // With right-split: seq=0, then split the remainder "A_B_C_D" at the
      // last underscore: src="A_B_C", tgt="D"
      expect(graph.edges[0].src).toBe('A_B_C');
      expect(graph.edges[0].tgt).toBe('D');
    });
  });
});
