/**
 * dragInteraction.ts — State & Interaction Manager for Flowchart Node Dragging
 *
 * References:
 *   Algorithm 3 — Pointer Coordinate Conversion (getViewBoxPoint)
 *   Algorithm 4 — Drag State Management & Snapshot Pattern (undo/redo)
 *
 * Integrates with MermaidGraphParser for initial SVG analysis.
 */

import { MermaidGraphParser } from './MermaidGraphParser.js';
import { updateEdgePath, type Rect } from './edge-path.js';

// ── Internal Types ────────────────────────────────────────────────────────

/** Callback hooks exposed to consumers. */
export interface FlowchartDragCallbacks {
  /** Fired when a node drag begins. */
  onDragStart?: (nodeId: string, pos: Point) => void;
  /** Fired on every pointer move during a drag. */
  onDragMove?: (nodeId: string, pos: Point) => void;
  /** Fired when a node drag ends. */
  onDragEnd?: (nodeId: string, pos: Point) => void;
  /** Fired after any state mutation (drag-end, undo, redo). */
  onStateChange?: () => void;
}

export interface FlowchartDragOptions {
  enableKeyboardUndo?: boolean; // default true
  maxUndoStack?: number; // default 50
  callbacks?: FlowchartDragCallbacks;
}

interface Point {
  x: number;
  y: number;
}

/** One node's tracked state within the drag system. */
interface DragNodeState {
  element: SVGGElement;
  x: number;
  y: number;
}

/** One edge's tracked state within the drag system. */
interface DragEdgeState {
  id: string;
  src: string;
  tgt: string;
  pathEl: SVGPathElement;
  labelEl: SVGGElement | null;
}

/** Compact serialisation of the entire graph for undo/redo snapshots. */
interface DragSnapshot {
  nodes: Record<string, { x: number; y: number }>;
  edges: Record<string, string>;
}

/** Pre-computed rect of a node in edgePaths space, captured at pointer-down. */
interface CachedRect {
  cx: number;
  cy: number;
  height: number;
  /** 'diamond' if the node contains a <polygon> element, otherwise 'rect'. */
  shapeType: import('./edge-path.js').ShapeType;
  width: number;
  x: number;
  y: number;
}

/** Active drag state — only non-null while a pointer is down on a node. */
interface ActiveDrag {
  nodeId: string;
  startPointerX: number;
  startPointerY: number;
  startNodeX: number;
  startNodeY: number;
  connectedEdges: DragEdgeState[];
  /** All involved node rects in edgePaths space, captured once at pointer-down. */
  initialRects: Record<string, CachedRect>;
}

// ── CTM-Based Coordinate Mapping ──────────────────────────────────────

/**
 * Map a point from one SVG element's local coordinate space to another's,
 * using screen CTM (getScreenCTM) as the common reference frame.
 *
 * This handles arbitrary nested transforms, viewBox scaling, and any
 * other SVG coordinate system transformations — no regex parsing needed.
 */
function mapPointToSpace(
  pt: { x: number; y: number },
  fromEl: SVGGraphicsElement,
  toEl: SVGGraphicsElement,
  cachedToInverse?: DOMMatrix | null
): { x: number; y: number } | null {
  const fromCTM = fromEl.getScreenCTM();
  if (!fromCTM) return null;

  const toInverse = cachedToInverse ?? toEl.getScreenCTM()?.inverse() ?? null;
  if (!toInverse) return null;

  const svg = fromEl.ownerSVGElement;
  if (!svg) return null;
  const svgPt = svg.createSVGPoint();
  svgPt.x = pt.x;
  svgPt.y = pt.y;

  const screenPt = svgPt.matrixTransform(fromCTM);
  const finalPt = screenPt.matrixTransform(toInverse);

  return { x: finalPt.x, y: finalPt.y };
}

/**
 * Compute an element's bounding rectangle in the target element's
 * coordinate space.  Maps all four corners through CTM so width/height
 * are correct even when the two spaces differ in scale.
 */
function getRectInSpace(
  el: SVGGraphicsElement,
  targetSpace: SVGGraphicsElement,
  cachedTargetInverse?: DOMMatrix | null
): Rect | null {
  try {
    const bbox = el.getBBox();
    if (bbox.width === 0 && bbox.height === 0) return null;

    const corners = [
      { x: bbox.x, y: bbox.y },
      { x: bbox.x + bbox.width, y: bbox.y },
      { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
      { x: bbox.x, y: bbox.y + bbox.height }
    ];

    const mapped = corners.map((c) => mapPointToSpace(c, el, targetSpace, cachedTargetInverse));
    if (mapped.some((p) => p === null)) return null;
    const valid = mapped as { x: number; y: number }[];

    const xs = valid.map((p) => p.x);
    const ys = valid.map((p) => p.y);

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  } catch {
    return null;
  }
}

/**
 * Get an element's translate offset relative to its immediate parent
 * by mapping the element's local origin (0,0) into the parent's space.
 * Mermaid nodes are centred at their local origin.
 */
function getTranslate(el: SVGGraphicsElement): { x: number; y: number } | null {
  const parentEl = el.parentElement;
  if (!parentEl || !(parentEl instanceof SVGGraphicsElement)) return null;
  return mapPointToSpace({ x: 0, y: 0 }, el, parentEl);
}

// ── DOM Helpers ───────────────────────────────────────────────────────

/** Set the translate transform on a node group element. */
function setTransform(g: SVGGElement, x: number, y: number): void {
  g.setAttribute('transform', `translate(${x.toFixed(1)}, ${y.toFixed(1)})`);
}

/**
 * Find an edge label group that is an adjacent sibling of the edgePath group.
 * Mermaid typically renders `<g class="edgeLabel">` immediately after the
 * corresponding `<g class="edgePath">`, so we check `previousElementSibling`.
 */
function findAdjacentEdgeLabel(edgeGroup: Element): SVGGElement | null {
  const parent = edgeGroup.parentElement;
  if (!parent) return null;
  const labels = parent.querySelectorAll<SVGGElement>('.edgeLabel');
  for (const label of labels) {
    if (label.previousElementSibling === edgeGroup) return label;
  }
  return null;
}

// ── FlowchartDrag ─────────────────────────────────────────────────────────

export class FlowchartDrag {
  private svg: SVGSVGElement;
  private edgeGroup: SVGGraphicsElement;
  private nodeStates = new Map<string, DragNodeState>();
  private edgeStates = new Map<string, DragEdgeState>();
  private graph: ReturnType<MermaidGraphParser['parse']>;

  private undoStack: DragSnapshot[] = [];
  private redoStack: DragSnapshot[] = [];
  private readonly maxUndo: number;

  private dragState: ActiveDrag | null = null;
  private enabled = false;
  private opts: Required<Omit<FlowchartDragOptions, 'callbacks'>> & {
    callbacks: FlowchartDragCallbacks;
  };

  // Bound handlers for clean add / remove cycles
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(svg: SVGSVGElement, options: FlowchartDragOptions = {}) {
    this.svg = svg;
    this.opts = {
      enableKeyboardUndo: options.enableKeyboardUndo ?? true,
      maxUndoStack: options.maxUndoStack ?? 50,
      callbacks: options.callbacks ?? {}
    };
    this.maxUndo = this.opts.maxUndoStack;

    // Locate the edgePaths container for CTM-based coordinate mapping
    this.edgeGroup = (svg.querySelector('g.edgePaths') as SVGGraphicsElement) ?? svg;

    // Parse SVG via the shared extraction layer
    const parser = new MermaidGraphParser(svg);
    this.graph = parser.parse();
    this.buildInternalState();

    // Capture initial state as base snapshot for undo (quick tap undo → original layout)
    this.undoStack.push(this.captureState());

    // Bind handlers once for stable listener identity
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
  }

  // ── Public API ───────────────────────────────────────────────────────

  /** Attach all event listeners. Idempotent. */
  enable(): void {
    if (this.enabled) return;
    this.enabled = true;

    for (const state of this.nodeStates.values()) {
      state.element.addEventListener('pointerdown', this.boundPointerDown);
      state.element.style.cursor = 'grab';
    }

    document.addEventListener('pointermove', this.boundPointerMove);
    document.addEventListener('pointerup', this.boundPointerUp);
    document.addEventListener('keydown', this.boundKeyDown);
  }

  /** Detach all event listeners. Safe to re-enable later. */
  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;

    for (const state of this.nodeStates.values()) {
      state.element.removeEventListener('pointerdown', this.boundPointerDown);
      state.element.style.cursor = '';
    }

    document.removeEventListener('pointermove', this.boundPointerMove);
    document.removeEventListener('pointerup', this.boundPointerUp);
    document.removeEventListener('keydown', this.boundKeyDown);

    this.dragState = null;
  }

  /** Tear down completely. Call before discarding. */
  destroy(): void {
    this.disable();
    this.nodeStates.clear();
    this.edgeStates.clear();
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }

  /** Re-parse the SVG and rebuild internal state (e.g. after diagram update). */
  refresh(svg?: SVGSVGElement): void {
    if (svg) {
      this.svg = svg;
      this.edgeGroup = (svg.querySelector('g.edgePaths') as SVGGraphicsElement) ?? svg;
    }
    const wasEnabled = this.enabled;
    this.disable();
    this.nodeStates.clear();
    this.edgeStates.clear();

    const parser = new MermaidGraphParser(this.svg);
    this.graph = parser.parse();
    this.buildInternalState();

    this.undoStack.length = 0;
    this.redoStack.length = 0;

    if (wasEnabled) this.enable();
  }

  /** Undo the last drag operation. Returns true on success. */
  undo(): boolean {
    if (this.undoStack.length === 0) return false;
    this.redoStack.push(this.captureState());
    if (this.redoStack.length > this.maxUndo) {
      this.redoStack.shift();
    }
    const snap = this.undoStack.pop();
    if (!snap) return false;
    this.applySnapshot(snap);
    this.opts.callbacks.onStateChange?.();
    return true;
  }

  /** Redo the last undone operation. Returns true on success. */
  redo(): boolean {
    if (this.redoStack.length === 0) return false;
    this.undoStack.push(this.captureState());
    if (this.undoStack.length > this.maxUndo) {
      this.undoStack.shift();
    }
    const snap = this.redoStack.pop();
    if (!snap) return false;
    this.applySnapshot(snap);
    this.opts.callbacks.onStateChange?.();
    return true;
  }

  /** Whether an undo operation is currently available. */
  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /** Whether a redo operation is currently available. */
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Return a copy of current node positions. */
  getNodePositions(): Record<string, Point> {
    const pos: Record<string, Point> = {};
    for (const [id, state] of this.nodeStates) {
      pos[id] = { x: state.x, y: state.y };
    }
    return pos;
  }

  /** Serialize current layout to JSON for export/download. */
  exportLayout(): string {
    return JSON.stringify(this.captureState(), null, 2);
  }

  // ── Coordinate Conversion (Algorithm 3) ──────────────────────────────

  /**
   * Convert a browser clientX / clientY pair to SVG viewBox coordinates
   * by inverting the SVG's current screen CTM (which accounts for viewBox
   * scaling, pan/zoom transforms, etc.).
   */
  private getViewBoxPoint(clientX: number, clientY: number): Point {
    const pt = this.svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = this.svg.getScreenCTM();
    if (ctm) {
      const inv = ctm.inverse();
      return { x: pt.matrixTransform(inv).x, y: pt.matrixTransform(inv).y };
    }
    // Fallback: manual viewBox computation (CTM unavailable in some envs)
    const rect = this.svg.getBoundingClientRect();
    const vb = this.svg.viewBox.baseVal;
    const sx = vb.width / rect.width;
    const sy = vb.height / rect.height;
    return {
      x: (clientX - rect.left) * sx + vb.x,
      y: (clientY - rect.top) * sy + vb.y
    };
  }

  // ── Snapshot Management (Algorithm 4) ────────────────────────────────

  private captureState(): DragSnapshot {
    const nodes: Record<string, { x: number; y: number }> = {};
    for (const [id, ns] of this.nodeStates) {
      nodes[id] = { x: ns.x, y: ns.y };
    }
    const edges: Record<string, string> = {};
    for (const [id, es] of this.edgeStates) {
      edges[id] = es.pathEl.getAttribute('d') ?? '';
    }
    return { nodes, edges };
  }

  private applySnapshot(snap: DragSnapshot): void {
    for (const [id, pos] of Object.entries(snap.nodes)) {
      const ns = this.nodeStates.get(id);
      if (!ns) continue;
      setTransform(ns.element, pos.x, pos.y);
      ns.x = pos.x;
      ns.y = pos.y;
    }
    for (const [id, d] of Object.entries(snap.edges)) {
      const es = this.edgeStates.get(id);
      if (!es) continue;
      es.pathEl.setAttribute('d', d);
      if (es.labelEl) {
        try {
          const len = es.pathEl.getTotalLength();
          if (len > 0) {
            const mid = es.pathEl.getPointAtLength(len / 2);
            // Map midpoint from path space into label's parent space via CTM
            const labelParent = es.labelEl.parentElement as SVGGraphicsElement | null;
            let tx = mid.x,
              ty = mid.y;
            if (labelParent && labelParent.getScreenCTM) {
              const pathCTM = es.pathEl.getScreenCTM();
              const parentCTM = labelParent.getScreenCTM();
              if (pathCTM && parentCTM) {
                const svg = this.svg;
                const pt = svg.createSVGPoint();
                pt.x = mid.x;
                pt.y = mid.y;
                const screenPt = pt.matrixTransform(pathCTM);
                const finalPt = screenPt.matrixTransform(parentCTM.inverse());
                tx = finalPt.x;
                ty = finalPt.y;
              }
            }
            es.labelEl.setAttribute('transform', `translate(${tx.toFixed(1)}, ${ty.toFixed(1)})`);
          }
        } catch {
          /* path not renderable */
        }
      }
    }
  }

  // ── Internal State Build ─────────────────────────────────────────────

  /** Build the drag-system's own node/edge state from MermaidGraphParser output. */
  private buildInternalState(): void {
    // Nodes: use CTM to get the initial translate offset (parent-space
    // position of the node's local origin).  Mermaid nodes are centred at
    // (0,0) in their local coordinate system.
    for (const [nodeId, nodeData] of this.graph.nodes) {
      const translate = getTranslate(nodeData.element);
      this.nodeStates.set(nodeId, {
        element: nodeData.element,
        x: translate?.x ?? 0,
        y: translate?.y ?? 0
      });
    }

    // Edges: resolve <path> and optional <g.edgeLabel> from each edge group
    for (const edgeData of this.graph.edges) {
      const pathEl = edgeData.element as SVGPathElement;
      if (!pathEl || pathEl.tagName !== 'path') continue;

      // label resolved by parser (Mermaid 11+), fallback for Mermaid 10.x
      const labelEl =
        (edgeData.labelEl as SVGGElement | null) ?? findAdjacentEdgeLabel(edgeData.element) ?? null;

      this.edgeStates.set(edgeData.id, {
        id: edgeData.id,
        labelEl,
        pathEl,
        src: edgeData.src,
        tgt: edgeData.tgt
      });
    }
  }

  /** Return all DragEdgeStates connected to the given node (incoming + outgoing). */
  private getConnectedEdges(nodeId: string): DragEdgeState[] {
    const incoming = this.graph.getIncoming(nodeId);
    const outgoing = this.graph.getOutgoing(nodeId);
    const seen = new Set<string>();
    const result: DragEdgeState[] = [];
    for (const e of incoming) {
      const es = this.edgeStates.get(e.id);
      if (es && !seen.has(es.id)) {
        seen.add(es.id);
        result.push(es);
      }
    }
    for (const e of outgoing) {
      const es = this.edgeStates.get(e.id);
      if (es && !seen.has(es.id)) {
        seen.add(es.id);
        result.push(es);
      }
    }
    return result;
  }

  // ── Event Handlers ───────────────────────────────────────────────────

  private onPointerDown(e: PointerEvent): void {
    if (!this.enabled) return;
    if (e.button !== 0) return;

    const g = e.currentTarget as SVGGElement;
    const rawId = g.id || g.getAttribute('data-id');
    if (!rawId) return;

    let nodeId: string | null = null;
    for (const [id, ns] of this.nodeStates) {
      if (ns.element === g) {
        nodeId = id;
        break;
      }
    }
    if (!nodeId) return;

    const ns = this.nodeStates.get(nodeId);
    if (!ns) return;

    g.setPointerCapture(e.pointerId);
    e.stopPropagation(); // prevent pan/zoom from hijacking
    e.preventDefault();  // suppress synthetic mouse events that may feed Hammer

    const vbPt = this.getViewBoxPoint(e.clientX, e.clientY);
    const connected = this.getConnectedEdges(nodeId);

    // ── Snapshot: capture all involved node rects in edgePaths space ──
    // These are computed ONCE via CTM and then reused via delta math
    // during pointer-move — no further DOM reads needed.
    const involvedIds = new Set<string>([nodeId]);
    for (const edge of connected) {
      involvedIds.add(edge.src);
      involvedIds.add(edge.tgt);
    }

    const edgeInverseCTM = this.edgeGroup.getScreenCTM()?.inverse() ?? null;
    const initialRects: Record<string, CachedRect> = {};
    for (const id of involvedIds) {
      const nodeNs = this.nodeStates.get(id);
      if (!nodeNs) continue;
      const rect = getRectInSpace(nodeNs.element, this.edgeGroup, edgeInverseCTM);
      if (rect) {
        const shapeType = nodeNs.element.querySelector('polygon') !== null ? 'diamond' : 'rect';
        initialRects[id] = {
          cx: rect.x + rect.width / 2,
          cy: rect.y + rect.height / 2,
          height: rect.height,
          shapeType,
          width: rect.width,
          x: rect.x,
          y: rect.y
        };
      }
    }

    this.dragState = {
      connectedEdges: connected,
      initialRects,
      nodeId,
      startNodeX: ns.x,
      startNodeY: ns.y,
      startPointerX: vbPt.x,
      startPointerY: vbPt.y
    };

    g.classList.add('dragging');
    g.style.cursor = 'grabbing';

    this.opts.callbacks.onDragStart?.(nodeId, { x: ns.x, y: ns.y });
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.dragState) return;

    e.stopPropagation(); // prevent pan/zoom Hammer from hijacking drag
    e.preventDefault(); // suppress pan/scroll default

    const vbPt = this.getViewBoxPoint(e.clientX, e.clientY);
    const dx = vbPt.x - this.dragState.startPointerX;
    const dy = vbPt.y - this.dragState.startPointerY;

    const nx = this.dragState.startNodeX + dx;
    const ny = this.dragState.startNodeY + dy;

    const ns = this.nodeStates.get(this.dragState.nodeId);
    if (!ns) return;

    // Update the dragged node's visual position
    setTransform(ns.element, nx, ny);
    ns.x = nx;
    ns.y = ny;

    // ── Delta Derivation (zero DOM reads) ────────────────────────────
    // The dragged node's rect in edgePaths space is its initial snapshot
    // plus the viewBox-space pointer delta.  Peer nodes use the cached
    // initial rect — they haven't moved.
    const draggedInitial = this.dragState.initialRects[this.dragState.nodeId];
    if (!draggedInitial) return;

    const currentRect: Rect = {
      height: draggedInitial.height,
      width: draggedInitial.width,
      x: draggedInitial.x + dx,
      y: draggedInitial.y + dy
    };
    const currentShape = draggedInitial.shapeType;

    const draggedId = this.dragState.nodeId;
    for (const es of this.dragState.connectedEdges) {
      const srcCached = this.dragState.initialRects[es.src];
      const tgtCached = this.dragState.initialRects[es.tgt];
      if (!srcCached || !tgtCached) continue;

      const srcRect: Rect = es.src === draggedId ? currentRect : srcCached;
      const tgtRect: Rect = es.tgt === draggedId ? currentRect : tgtCached;
      const srcShape = es.src === draggedId ? currentShape : srcCached.shapeType;
      const tgtShape = es.tgt === draggedId ? currentShape : tgtCached.shapeType;

      updateEdgePath(srcRect, tgtRect, es.pathEl, es.labelEl, srcShape, tgtShape);
    }

    this.opts.callbacks.onDragMove?.(draggedId, { x: nx, y: ny });
  }
  private onPointerUp(e: PointerEvent): void {
    if (!this.dragState) return;

    e.stopPropagation(); // prevent pan/zoom Hammer from hijacking drag
    e.preventDefault(); // suppress click/pan default

    const ns = this.nodeStates.get(this.dragState.nodeId);
    if (ns) {
      ns.element.classList.remove('dragging');
      ns.element.style.cursor = 'grab';

      // Release pointer capture
      try {
        ns.element.releasePointerCapture(e.pointerId);
      } catch {
        /* may already be released */
      }

      this.opts.callbacks.onDragEnd?.(this.dragState.nodeId, {
        x: ns.x,
        y: ns.y
      });
    }

    // Only push to undo stack if the node actually moved
    const moved = ns && (ns.x !== this.dragState.startNodeX || ns.y !== this.dragState.startNodeY);

    if (moved) {
      const snap = this.captureState();
      this.undoStack.push(snap);
      if (this.undoStack.length > this.maxUndo) {
        this.undoStack.shift();
      }
      this.redoStack.length = 0;
    }

    this.dragState = null;
    this.opts.callbacks.onStateChange?.();
  }

  // ── Keyboard Shortcuts ───────────────────────────────────────────────

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.opts.enableKeyboardUndo) return;
    // Don't trigger undo/redo while the user is editing code in a text input
    if (this.isEditingText()) return;

    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;

    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.undo();
    } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
      e.preventDefault();
      this.redo();
    }
  }

  /** Heuristic to avoid hijacking Ctrl+Z when focused on a text editor. */
  private isEditingText(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return true;
    if ((el as HTMLElement).isContentEditable) return true;
    // Monaco editor uses a specific container
    if (el.closest('.monaco-editor')) return true;
    return false;
  }
}
