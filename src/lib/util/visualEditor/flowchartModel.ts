/**
 * Flowchart model: a structured, round-trippable representation of a Mermaid
 * flowchart used by the visual editor.
 *
 * Parsing is done by reading Mermaid's own flowchart database (the same parser
 * that drives rendering) so the structure is always accurate. Serialization is
 * fully owned here and produces a clean, canonical flowchart where every node
 * is declared inside the subgraph that owns it. This makes subgraph membership
 * unambiguous, which is what lets the visual editor move nodes between
 * subgraphs reliably.
 */
import mermaid from 'mermaid';

export type NodeShape =
  | 'rect'
  | 'rounded'
  | 'stadium'
  | 'subroutine'
  | 'cylinder'
  | 'circle'
  | 'doublecircle'
  | 'asymmetric'
  | 'rhombus'
  | 'hexagon'
  | 'parallelogram'
  | 'parallelogram_alt'
  | 'trapezoid'
  | 'trapezoid_alt';

export type LabelType = 'text' | 'string' | 'markdown';

export interface FlowNode {
  id: string;
  label: string;
  labelType: LabelType;
  shape: NodeShape;
  /** Raw style declarations from `style <id> ...`, e.g. ['fill:#bbf', 'stroke-width:2px']. */
  styles: string[];
  /** User-assigned classes (auto classes like `default`/`clickable` are stripped). */
  classes: string[];
  /** The id of the owning subgraph, or undefined when the node is top-level. */
  subgraph?: string;
}

export interface FlowEdge {
  start: string;
  end: string;
  label: string;
  labelType: LabelType;
  /** Mermaid edge type, e.g. arrow_point, arrow_open, arrow_circle, arrow_cross, double_arrow_point. */
  type: string;
  /** normal | thick | dotted | invisible */
  stroke: string;
  /** Link "length" (number of extra dashes); `-->` is 1, `--->` is 2, ... */
  length: number;
}

export interface FlowSubgraph {
  id: string;
  title: string;
  direction?: string;
  /** The id of the parent subgraph when nested, or undefined when top-level. */
  parent?: string;
}

export interface FlowClassDef {
  name: string;
  styles: string[];
}

export interface FlowchartModel {
  direction: string;
  /** Raw `--- ... ---` frontmatter block (without trailing newline), preserved verbatim. */
  frontmatter?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  subgraphs: FlowSubgraph[];
  classDefs: FlowClassDef[];
  /** `%%{ init }%%` directives, preserved verbatim and re-emitted before the header. */
  directives: string[];
  /** Other passthrough lines (click handlers, linkStyle, comments, acc*), preserved verbatim. */
  passthrough: string[];
}

// ---------------------------------------------------------------------------
// Shape <-> delimiter mapping
// ---------------------------------------------------------------------------

const DB_TYPE_TO_SHAPE: Record<string, NodeShape> = {
  circle: 'circle',
  cylinder: 'cylinder',
  diamond: 'rhombus',
  doublecircle: 'doublecircle',
  hexagon: 'hexagon',
  inv_trapezoid: 'trapezoid_alt',
  lean_left: 'parallelogram_alt',
  lean_right: 'parallelogram',
  odd: 'asymmetric',
  round: 'rounded',
  square: 'rect',
  stadium: 'stadium',
  subroutine: 'subroutine',
  trapezoid: 'trapezoid'
};

const SHAPE_DELIMITERS: Record<NodeShape, { open: string; close: string }> = {
  asymmetric: { close: ']', open: '>' },
  circle: { close: '))', open: '((' },
  cylinder: { close: ')]', open: '[(' },
  doublecircle: { close: ')))', open: '(((' },
  hexagon: { close: '}}', open: '{{' },
  parallelogram: { close: '/]', open: '[/' },
  parallelogram_alt: { close: '\\]', open: '[\\' },
  rect: { close: ']', open: '[' },
  rhombus: { close: '}', open: '{' },
  rounded: { close: ')', open: '(' },
  stadium: { close: '])', open: '([' },
  subroutine: { close: ']]', open: '[[' },
  trapezoid: { close: '\\]', open: '[/' },
  trapezoid_alt: { close: '/]', open: '[\\' }
};

export const SHAPE_LABELS: { value: NodeShape; label: string }[] = [
  { value: 'rect', label: 'Rectangle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'stadium', label: 'Stadium' },
  { value: 'subroutine', label: 'Subroutine' },
  { value: 'cylinder', label: 'Database' },
  { value: 'circle', label: 'Circle' },
  { value: 'doublecircle', label: 'Double circle' },
  { value: 'asymmetric', label: 'Flag' },
  { value: 'rhombus', label: 'Diamond' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'parallelogram', label: 'Parallelogram' },
  { value: 'parallelogram_alt', label: 'Parallelogram alt' },
  { value: 'trapezoid', label: 'Trapezoid' },
  { value: 'trapezoid_alt', label: 'Trapezoid alt' }
];

const dbTypeToShape = (type: string | undefined): NodeShape => {
  if (!type) {
    return 'rect';
  }
  return DB_TYPE_TO_SHAPE[type] ?? 'rect';
};

// ---------------------------------------------------------------------------
// Minimal typings for the (internal) Mermaid flowchart database.
// ---------------------------------------------------------------------------

interface FlowVertex {
  id: string;
  text: string;
  type?: string;
  styles?: string[];
  classes?: string[];
  labelType?: LabelType;
  link?: string;
}

interface FlowDbEdge {
  start: string;
  end: string;
  text?: string;
  type?: string;
  stroke?: string;
  length?: number;
  labelType?: LabelType;
}

interface FlowDbSubGraph {
  id: string;
  title?: string;
  nodes: string[];
  dir?: string;
  labelType?: LabelType;
}

interface FlowDbClass {
  id: string;
  styles?: string[];
  textStyles?: string[];
}

interface FlowDb {
  getVertices: () => Map<string, FlowVertex>;
  getEdges: () => FlowDbEdge[];
  getSubGraphs: () => FlowDbSubGraph[];
  getClasses: () => Map<string, FlowDbClass>;
  getDirection: () => string | undefined;
}

interface ParsedDiagram {
  db: FlowDb;
}

interface MermaidInternal {
  mermaidAPI: {
    getDiagramFromText: (text: string) => Promise<ParsedDiagram>;
  };
}

const AUTO_CLASSES = new Set(['default', 'clickable']);

const splitFrontmatter = (code: string): { frontmatter?: string; body: string } => {
  const match = /^\s*---\n([\s\S]*?)\n---\n?/.exec(code);
  if (!match) {
    return { body: code };
  }
  return { frontmatter: match[0].replace(/\n+$/, ''), body: code.slice(match[0].length) };
};

const collectPassthrough = (body: string): { directives: string[]; passthrough: string[] } => {
  const directives: string[] = [];
  const passthrough: string[] = [];
  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('%%{')) {
      directives.push(line);
    } else if (
      line.startsWith('click ') ||
      line.startsWith('linkStyle ') ||
      line.startsWith('accTitle') ||
      line.startsWith('accDescr')
    ) {
      passthrough.push(line);
    }
  }
  return { directives, passthrough };
};

/**
 * Parse flowchart source into a {@link FlowchartModel} using Mermaid's own
 * parser. Returns `undefined` for non-flowchart diagrams or on any parse error,
 * so callers can safely fall back to read-only preview.
 */
export const parseFlowchart = async (code: string): Promise<FlowchartModel | undefined> => {
  const api = (mermaid as unknown as MermaidInternal).mermaidAPI;
  if (!api?.getDiagramFromText) {
    return undefined;
  }

  let diagram: ParsedDiagram;
  try {
    diagram = await api.getDiagramFromText(code);
  } catch {
    // Built-in diagrams may not be registered yet; priming `parse` fixes that.
    try {
      await mermaid.parse(code);
      diagram = await api.getDiagramFromText(code);
    } catch {
      return undefined;
    }
  }

  const db = diagram.db;
  if (
    typeof db?.getVertices !== 'function' ||
    typeof db.getEdges !== 'function' ||
    typeof db.getSubGraphs !== 'function'
  ) {
    // Not a flowchart database.
    return undefined;
  }

  try {
    const { frontmatter, body } = splitFrontmatter(code);
    const { directives, passthrough } = collectPassthrough(body);

    const dbSubgraphs = db.getSubGraphs();

    // Map every node/subgraph id to its direct parent subgraph.
    const parentOf = new Map<string, string>();
    for (const sg of dbSubgraphs) {
      for (const childId of sg.nodes) {
        parentOf.set(childId, sg.id);
      }
    }

    const subgraphIds = new Set(dbSubgraphs.map((sg) => sg.id));

    const subgraphs: FlowSubgraph[] = dbSubgraphs.map((sg) => ({
      id: sg.id,
      title: sg.title ?? sg.id,
      direction: sg.dir,
      parent: parentOf.get(sg.id)
    }));

    const nodes: FlowNode[] = [];
    for (const [id, vertex] of db.getVertices()) {
      const owning = parentOf.get(id);
      nodes.push({
        classes: (vertex.classes ?? []).filter((c) => !AUTO_CLASSES.has(c)),
        id,
        label: vertex.text ?? id,
        labelType: vertex.labelType ?? 'text',
        shape: dbTypeToShape(vertex.type),
        styles: [...(vertex.styles ?? [])],
        subgraph: owning && subgraphIds.has(owning) ? owning : undefined
      });
    }

    const edges: FlowEdge[] = db.getEdges().map((edge) => ({
      end: edge.end,
      label: edge.text ?? '',
      labelType: edge.labelType ?? 'text',
      length: edge.length ?? 1,
      start: edge.start,
      stroke: edge.stroke ?? 'normal',
      type: edge.type ?? 'arrow_point'
    }));

    const classDefs: FlowClassDef[] = [];
    for (const [name, def] of db.getClasses()) {
      classDefs.push({
        name,
        styles: [...(def.styles ?? []), ...(def.textStyles ?? [])]
      });
    }

    return {
      classDefs,
      direction: db.getDirection() ?? 'TB',
      directives,
      edges,
      frontmatter,
      nodes,
      passthrough,
      subgraphs
    };
  } catch {
    return undefined;
  }
};

// ---------------------------------------------------------------------------
// Style helpers (used by the properties panel)
// ---------------------------------------------------------------------------

/** Read a single CSS-style property (e.g. `fill`) from a list of `prop:value` declarations. */
export const getStyleProp = (styles: string[], prop: string): string | undefined => {
  for (const decl of styles) {
    const idx = decl.indexOf(':');
    if (idx !== -1 && decl.slice(0, idx).trim() === prop) {
      return decl.slice(idx + 1).trim();
    }
  }
  return undefined;
};

/**
 * Return a new style list with `prop` set to `value`, preserving order. Passing
 * an empty/undefined value removes the property.
 */
export const setStyleProp = (
  styles: string[],
  prop: string,
  value: string | undefined
): string[] => {
  const next = styles.filter((decl) => {
    const idx = decl.indexOf(':');
    return idx === -1 || decl.slice(0, idx).trim() !== prop;
  });
  if (value !== undefined && value !== '') {
    next.push(`${prop}:${value}`);
  }
  return next;
};

// ---------------------------------------------------------------------------
// Structural editing operations
// ---------------------------------------------------------------------------

const edgeLike = (start: string, end: string, like: FlowEdge): FlowEdge => ({
  end,
  label: '',
  labelType: 'text',
  length: like.length,
  start,
  stroke: like.stroke,
  type: like.type
});

/**
 * Splice a node into an existing connection, rewiring the connectors so the
 * node sits between the edge's endpoints (`X --> node --> Y`). The gap the node
 * leaves behind is healed by joining each of its predecessors to each of its
 * successors, so dragging a box onto a connector reorders it within the flow.
 *
 * Mutates `model` in place. Returns `false` (no change) when the move is not
 * valid, e.g. dropping a node onto one of its own edges.
 */
export const insertNodeIntoEdge = (
  model: FlowchartModel,
  nodeId: string,
  edgeIndex: number
): boolean => {
  const target = model.edges[edgeIndex];
  if (!target || target.start === nodeId || target.end === nodeId) {
    return false;
  }
  const node = model.nodes.find((n) => n.id === nodeId);
  if (!node) {
    return false;
  }

  const incoming = model.edges.filter((e) => e.end === nodeId && e.start !== nodeId);
  const outgoing = model.edges.filter((e) => e.start === nodeId && e.end !== nodeId);

  // Drop every edge currently touching the node; it is being rewired.
  const remaining = model.edges.filter((e) => e.start !== nodeId && e.end !== nodeId);

  // Heal the gap: connect each predecessor to each successor.
  const healed: FlowEdge[] = [];
  const connects = (start: string, end: string): boolean =>
    remaining.some((e) => e.start === start && e.end === end) ||
    healed.some((e) => e.start === start && e.end === end);
  for (const pred of incoming) {
    for (const succ of outgoing) {
      if (pred.start !== succ.end && !connects(pred.start, succ.end)) {
        healed.push(edgeLike(pred.start, succ.end, pred));
      }
    }
  }

  // Splice the node into the dropped connection: keep the original connector's
  // style/label on the first half, use a matching plain arrow for the second.
  const index = remaining.indexOf(target);
  remaining.splice(index, 1, { ...target, end: nodeId }, edgeLike(nodeId, target.end, target));
  model.edges = [...remaining, ...healed];

  // Co-locate the node with its new neighbours when they share a group.
  const startNode = model.nodes.find((n) => n.id === target.start);
  const endNode = model.nodes.find((n) => n.id === target.end);
  if (startNode && endNode && startNode.subgraph === endNode.subgraph) {
    node.subgraph = startNode.subgraph;
  }
  return true;
};

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

const LABEL_NEEDS_QUOTES = /[[\](){}|<>"'#=;:&%`]/;

const quoteLabel = (label: string, labelType: LabelType): string => {
  if (labelType === 'markdown') {
    return '"`' + label.replaceAll('`', '\\`') + '`"';
  }
  if (label === '' || LABEL_NEEDS_QUOTES.test(label) || /^\s|\s$/.test(label)) {
    return '"' + label.replaceAll('"', '&quot;') + '"';
  }
  return label;
};

const nodeDeclaration = (node: FlowNode): string => {
  // A plain rectangle whose label is just its id needs no shape wrapper.
  if (node.shape === 'rect' && node.label === node.id) {
    return node.id;
  }
  const { open, close } = SHAPE_DELIMITERS[node.shape];
  return `${node.id}${open}${quoteLabel(node.label, node.labelType)}${close}`;
};

const ARROW_ENDS: Record<string, { start: string; end: string }> = {
  arrow_circle: { end: 'o', start: '' },
  arrow_cross: { end: 'x', start: '' },
  arrow_open: { end: '', start: '' },
  arrow_point: { end: '>', start: '' },
  double_arrow_circle: { end: 'o', start: 'o' },
  double_arrow_cross: { end: 'x', start: 'x' },
  double_arrow_point: { end: '>', start: '<' }
};

const edgeConnector = (edge: FlowEdge): string => {
  const ends = ARROW_ENDS[edge.type] ?? ARROW_ENDS.arrow_point;
  const length = Math.max(1, edge.length);
  const hasHead = ends.start !== '' || ends.end !== '';

  if (edge.stroke === 'invisible') {
    return '~'.repeat(length + 2);
  }
  if (edge.stroke === 'dotted') {
    const body = '-' + '.'.repeat(length) + '-';
    return hasHead ? `${ends.start}${body}${ends.end}` : body;
  }
  const dash = edge.stroke === 'thick' ? '=' : '-';
  if (!hasHead) {
    return dash.repeat(length + 2);
  }
  return `${ends.start}${dash.repeat(length + 1)}${ends.end}`;
};

const edgeStatement = (edge: FlowEdge): string => {
  const connector = edgeConnector(edge);
  if (edge.label) {
    return `${edge.start} ${connector}|${quoteLabel(edge.label, edge.labelType)}| ${edge.end}`;
  }
  return `${edge.start} ${connector} ${edge.end}`;
};

const subgraphHeader = (sg: FlowSubgraph): string => {
  if (sg.title === sg.id) {
    return `subgraph ${sg.id}`;
  }
  return `subgraph ${sg.id}[${quoteLabel(sg.title, 'text')}]`;
};

/** Serialize a {@link FlowchartModel} back into canonical flowchart source. */
export const serializeFlowchart = (model: FlowchartModel): string => {
  const lines: string[] = [];
  if (model.frontmatter) {
    lines.push(model.frontmatter);
  }
  for (const directive of model.directives) {
    lines.push(directive);
  }
  lines.push(`flowchart ${model.direction || 'TB'}`);

  const nodesBySubgraph = new Map<string | undefined, FlowNode[]>();
  for (const node of model.nodes) {
    const key = node.subgraph;
    const list = nodesBySubgraph.get(key);
    if (list) {
      list.push(node);
    } else {
      nodesBySubgraph.set(key, [node]);
    }
  }

  const childSubgraphs = new Map<string | undefined, FlowSubgraph[]>();
  for (const sg of model.subgraphs) {
    const list = childSubgraphs.get(sg.parent);
    if (list) {
      list.push(sg);
    } else {
      childSubgraphs.set(sg.parent, [sg]);
    }
  }

  const indent = (depth: number): string => '    '.repeat(depth);

  const emitSubgraph = (sg: FlowSubgraph, depth: number): void => {
    lines.push(`${indent(depth)}${subgraphHeader(sg)}`);
    if (sg.direction) {
      lines.push(`${indent(depth + 1)}direction ${sg.direction}`);
    }
    for (const child of childSubgraphs.get(sg.id) ?? []) {
      emitSubgraph(child, depth + 1);
    }
    for (const node of nodesBySubgraph.get(sg.id) ?? []) {
      lines.push(`${indent(depth + 1)}${nodeDeclaration(node)}`);
    }
    lines.push(`${indent(depth)}end`);
  };

  for (const sg of childSubgraphs.get(undefined) ?? []) {
    emitSubgraph(sg, 1);
  }

  for (const node of nodesBySubgraph.get(undefined) ?? []) {
    lines.push(`${indent(1)}${nodeDeclaration(node)}`);
  }

  for (const edge of model.edges) {
    lines.push(`${indent(1)}${edgeStatement(edge)}`);
  }

  for (const def of model.classDefs) {
    lines.push(`${indent(1)}classDef ${def.name} ${def.styles.join(',')}`);
  }

  // Group nodes by class so each class becomes a single `class a,b cls` line.
  const nodesByClass = new Map<string, string[]>();
  for (const node of model.nodes) {
    for (const cls of node.classes) {
      const list = nodesByClass.get(cls);
      if (list) {
        list.push(node.id);
      } else {
        nodesByClass.set(cls, [node.id]);
      }
    }
  }
  for (const [cls, ids] of nodesByClass) {
    lines.push(`${indent(1)}class ${ids.join(',')} ${cls}`);
  }

  for (const node of model.nodes) {
    if (node.styles.length > 0) {
      lines.push(`${indent(1)}style ${node.id} ${node.styles.join(',')}`);
    }
  }

  for (const line of model.passthrough) {
    lines.push(`${indent(1)}${line}`);
  }

  return lines.join('\n');
};
