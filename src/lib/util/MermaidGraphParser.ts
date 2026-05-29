/**
 * MermaidGraphParser — DOM Data Extraction Layer
 *
 * A standalone, framework-agnostic utility that parses a rendered Mermaid
 * flowchart SVG to extract nodes, edges, and their topological relationships.
 *
 * Usage:
 *   const parser = new MermaidGraphParser(svgRootElement);
 *   const graph = parser.parse();
 *   // graph.nodes  → Map<nodeId, NodeData>
 *   // graph.edges  → EdgeData[]
 *   // graph.getIncoming(nodeId), graph.getOutgoing(nodeId)
 */

export interface NodeData {
  id: string;
  label: string;
  bbox: { x: number; y: number; width: number; height: number };
  /** The <g> element wrapping this node — used for drag targeting */
  element: SVGGElement;
}

export interface EdgeData {
  id: string;
  src: string;
  tgt: string;
  /** The <path> element representing this edge */
  element: Element;
  /** Optional edge label wrapper <g class="edgeLabel">, contains the label <g> */
  labelEl?: Element;
}

export interface GraphData {
  nodes: Map<string, NodeData>;
  edges: EdgeData[];
  /** O(1) lookup of incoming edges for a node */
  getIncoming: (nodeId: string) => EdgeData[];
  /** O(1) lookup of outgoing edges for a node */
  getOutgoing: (nodeId: string) => EdgeData[];
}

export class MermaidGraphParser {
  private svg: SVGElement;

  constructor(svg: SVGElement) {
    this.svg = svg;
  }

  /**
   * Parse the SVG and return a structured graph model.
   */
  parse(): GraphData {
    const nodes = this.extractNodes();
    const edges = this.extractEdges();
    const incomingIndex = this.buildIndex(edges, 'src');
    const outgoingIndex = this.buildIndex(edges, 'tgt');

    return {
      nodes,
      edges,
      getIncoming: (nodeId: string) => incomingIndex.get(nodeId) ?? [],
      getOutgoing: (nodeId: string) => outgoingIndex.get(nodeId) ?? []
    };
  }

  // ── Node extraction ──────────────────────────────────────────────

  /**
   * Extract all flowchart nodes from the SVG.
   *
   * Mermaid renders each node as:
   *   <g id="flowchart-A-123" class="node">
   *     <rect .../>
   *     <text ...>label</text>
   *   </g>
   *
   * The id follows the pattern `flowchart-<nodeId>-<hash>`, but we
   * also handle the older convention `<g class="node">` with a direct id.
   */
  private extractNodes(): Map<string, NodeData> {
    const nodeMap = new Map<string, NodeData>();
    const nodeGroups = this.svg.querySelectorAll<SVGGElement>('g.node');

    nodeGroups.forEach((g) => {
      const id = this.resolveNodeId(g);
      if (!id) return;

      const bbox = this.getBBox(g);
      const label = this.extractNodeLabel(g);

      nodeMap.set(id, { id, label, bbox, element: g });
    });

    return nodeMap;
  }

  /**
   * Resolve the logical node id from a <g class="node"> element.
   *
   * Mermaid 11+ uses an id like "flowchart-A-123" where "A" is the
   * logical node name.  Older versions may use the raw id directly.
   */
  private resolveNodeId(g: SVGGElement): string | null {
    const rawId = g.id || g.getAttribute('data-id');
    if (!rawId) return null;

    // Mermaid 11+: "flowchart-<nodeId>-<counter>"
    // In the live editor, a viewID prefix is prepended, yielding
    // "<viewID>-flowchart-<nodeId>-<counter>"  (e.g. graph-1-flowchart-A-0).
    // The regex matches "flowchart-" anywhere, then extracts the logical nodeId.
    const mermaid11Match = rawId.match(/flowchart-(.+?)-\w+$/);
    if (mermaid11Match) return mermaid11Match[1];

    // If id attr has no match, try the data-id attr (clean logical ID)
    const dataId = g.getAttribute('data-id');
    if (dataId && dataId !== rawId) {
      const dMatch = dataId.match(/flowchart-(.+?)-\w+$/);
      if (dMatch) return dMatch[1];
      // data-id is typically the bare logical ID (e.g. "A")
      return dataId;
    }

    // Mermaid 10.x: sometimes the id IS the node id
    return rawId;
  }

  /**
   * Extract the visible text label from a node group.
   */
  private extractNodeLabel(g: SVGGElement): string {
    const textEl = g.querySelector<SVGTextElement>('text');
    return textEl?.textContent?.trim() ?? '';
  }

  /**
   * Get the bounding box of a group, falling back to the union of
   * child bounding boxes if getBBox is not available (e.g. foreignObject).
   */
  private getBBox(g: SVGGElement): { x: number; y: number; width: number; height: number } {
    try {
      const bbox = g.getBBox();
      return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
    } catch {
      // Fallback: sum child bounding boxes
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      g.querySelectorAll('rect, polygon, ellipse, circle, path').forEach((el) => {
        try {
          const b = (el as SVGGraphicsElement).getBBox();
          minX = Math.min(minX, b.x);
          minY = Math.min(minY, b.y);
          maxX = Math.max(maxX, b.x + b.width);
          maxY = Math.max(maxY, b.y + b.height);
        } catch {
          /* skip unmeasurable elements */
        }
      });
      if (Number.isFinite(minX)) {
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      }
      return { x: 0, y: 0, width: 0, height: 0 };
    }
  }

  // ── Edge extraction ──────────────────────────────────────────────

  /**
   * Extract all edges (connections) from the SVG.
   *
   * Mermaid 10.x: each edge wrapped in a <g class="edgePath"> with a <path> child.
   * Mermaid 11+:  <path> elements are direct children of <g class="edgePaths">,
   *                and labels live in a sibling <g class="edgeLabels"> container.
   *
   * The data-id format on the <path>: L_<srcNodeId>_<tgtNodeId>_<counter>
   *
   * This method normalizes both formats so `element` is always the <path> node.
   */
  private extractEdges(): EdgeData[] {
    const edges: EdgeData[] = [];

    // Build a label lookup by matching data-id on label groups.
    // Mermaid 11+ structure:
    //   <g class="edgeLabels"><g class="edgeLabel"><g class="label" data-id="L_A_B_0">...
    const labelMap = new Map<string, Element>();
    const edgeLabelGroups = this.svg.querySelectorAll<Element>('g.edgeLabels g.edgeLabel');
    edgeLabelGroups.forEach((edgeLabelGroup) => {
      const labelG = edgeLabelGroup.querySelector<Element>('g.label[data-id]');
      const lid = labelG?.getAttribute('data-id');
      if (lid) labelMap.set(lid, edgeLabelGroup);
    });

    // Mermaid 11+ format: <path data-id="..."> directly inside <g class="edgePaths">
    const mermaid11Paths = this.svg.querySelectorAll<Element>('g.edgePaths path[data-id]');
    if (mermaid11Paths.length > 0) {
      mermaid11Paths.forEach((pathEl) => {
        const dataId = pathEl.getAttribute('data-id');
        if (!dataId) return;

        const parsed = this.parseEdgeDataId(dataId);
        if (!parsed) {
          // Fallback: try parsing from path.id attribute (format: <diagramId>-L_A_B_0)
          const pathId = pathEl.getAttribute('id');
          if (pathId) {
            const lastDash = pathId.lastIndexOf('-');
            if (lastDash !== -1) {
              const fallbackDataId = pathId.slice(lastDash + 1);
              const fallbackParsed = this.parseEdgeDataId(fallbackDataId);
              if (fallbackParsed) {
                edges.push({
                  element: pathEl,
                  id: dataId,
                  labelEl: labelMap.get(dataId),
                  src: fallbackParsed.src,
                  tgt: fallbackParsed.tgt
                });
              }
            }
          }
          return;
        }

        edges.push({
          element: pathEl,
          id: dataId,
          labelEl: labelMap.get(dataId),
          src: parsed.src,
          tgt: parsed.tgt
        });
      });
      return edges;
    }

    // Mermaid 10.x fallback: individual <g class="edgePath"> wrappers
    const edgeGroups = this.svg.querySelectorAll<Element>('g.edgePath');
    if (edgeGroups.length > 0) {
      edgeGroups.forEach((g) => {
        const pathEl = g.querySelector<Element>('path');
        const dataId = pathEl?.getAttribute('data-id') ?? g.getAttribute('data-id');
        if (!dataId) return;

        const parsed = this.parseEdgeDataId(dataId);
        if (!parsed) return;

        edges.push({
          element: pathEl ?? g,
          id: dataId,
          labelEl: labelMap.get(dataId),
          src: parsed.src,
          tgt: parsed.tgt
        });
      });
      return edges;
    }

    // Last-resort fallback: query all paths with data-et="edge" (edge marker attr)
    const edgePaths = this.svg.querySelectorAll<Element>('path[data-et="edge"][data-id]');
    edgePaths.forEach((pathEl) => {
      const dataId = pathEl.getAttribute('data-id');
      if (!dataId) return;

      const parsed = this.parseEdgeDataId(dataId);
      if (!parsed) return;

      edges.push({
        element: pathEl,
        id: dataId,
        labelEl: labelMap.get(dataId),
        src: parsed.src,
        tgt: parsed.tgt
      });
    });

    return edges;
  }

  /**
   * Parse the mermaid edge data-id attribute.
   *
   * Format: L_<src>_<tgt>_<n>
   * Example: L_A_B_0 → { src: 'A', tgt: 'B', seq: 0 }
   *
   * Note: src/tgt values may contain dots (e.g. subgraph ports like "A.s"),
   * so we split from the right: the last segment is always the sequence number.
   */
  private parseEdgeDataId(dataId: string): { src: string; tgt: string; seq: number } | null {
    if (!dataId.startsWith('L_')) return null;

    // Right-split: the last segment is always the sequence number.
    // Node IDs may contain underscores (e.g. "A_B"), so we split from the right.
    const lastUnderscore = dataId.lastIndexOf('_');
    if (lastUnderscore === -1) return null;

    const seqStr = dataId.slice(lastUnderscore + 1);
    const seq = parseInt(seqStr, 10);
    if (Number.isNaN(seq)) return null;

    const remainder = dataId.slice(2, lastUnderscore); // skip "L_"
    const middleUnderscore = remainder.lastIndexOf('_');
    if (middleUnderscore === -1) return null;

    return {
      src: remainder.slice(0, middleUnderscore),
      tgt: remainder.slice(middleUnderscore + 1),
      seq
    };
  }

  // ── Index building ───────────────────────────────────────────────

  /**
   * Build an adjacency index mapping nodeId → edges.
   *
   * @param edges  All parsed edges
   * @param key    'src' for outgoing index, 'tgt' for incoming index
   */
  private buildIndex(edges: EdgeData[], key: 'src' | 'tgt'): Map<string, EdgeData[]> {
    const index = new Map<string, EdgeData[]>();
    for (const edge of edges) {
      const id = edge[key];
      if (!index.has(id)) {
        index.set(id, []);
      }
      const bucket = index.get(id);
      if (bucket) bucket.push(edge);
    }
    return index;
  }
}
