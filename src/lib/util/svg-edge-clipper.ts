/**
 * Edge clipping at node borders — trims SVG paths so connectors stop
 * precisely at the outer stroke of each node, never penetrating inside.
 *
 * Uses binary search along path length + rounded-rect hit testing to find
 * the exact border intersection, then rebuilds the path with trimmed endpoints.
 */

import { SVG_NS, NODE_BORDER_RADIUS, type NodeShapeBounds } from './svg-post-processor-types';

/**
 * Main entry: clip edge paths at node borders and fix SVG paint order.
 *
 * Strategy:
 * 1. Collect bounding boxes of all node shapes
 * 2. Trim each edge path so it terminates at the node border
 * 3. Inject clip paths for ER entity boxes
 * 4. Ensure nodes paint ABOVE edges so residual overlap is hidden
 */
export function clipEdgesAtNodeBorders(svg: SVGSVGElement, defs: SVGDefsElement): void {
  const nodeShapes = collectNodeShapes(svg);
  if (nodeShapes.length === 0) return;

  // Trim each edge path so it stops at the node border
  const edgePaths = svg.querySelectorAll<SVGPathElement>(
    '.flowchart-link, .edge-pattern-solid, .edge-pattern-dotted, ' +
      '.relation, .transition, path.er.relationshipLine'
  );
  edgePaths.forEach((path) => {
    trimPathAtNodeBorders(path, nodeShapes);
  });

  // ER-specific clip paths for relationship lines
  clipERRelationshipLines(svg, defs);

  // Class diagram: clip relation lines at class box borders
  clipClassRelationLines(svg, defs);

  // Fix SVG paint order per diagram type
  ensureNodesPaintAboveEdges(svg);
}

/** Collect bounding boxes + border-radius of all node shapes in the SVG */
function collectNodeShapes(svg: SVGSVGElement): NodeShapeBounds[] {
  const shapes: NodeShapeBounds[] = [];
  const selectors = [
    '.node rect',
    '.node circle',
    '.node ellipse',
    '.node polygon',
    '.actor',
    'g.classGroup rect',
    '.stateGroup rect',
    '.entityBox'
  ].join(', ');

  const elements = svg.querySelectorAll<SVGElement>(selectors);
  elements.forEach((el) => {
    try {
      const bbox = el.getBBox();
      if (bbox.width === 0 || bbox.height === 0) return;

      const rx = parseFloat(el.getAttribute('rx') ?? '0') || NODE_BORDER_RADIUS;
      const ry = parseFloat(el.getAttribute('ry') ?? '0') || NODE_BORDER_RADIUS;

      // Transform bbox to SVG coordinate space
      const ctm = el.getCTM();
      const svgCTM = svg.getCTM();
      if (ctm && svgCTM) {
        const relCTM = svgCTM.inverse().multiply(ctm);
        const x = relCTM.e + bbox.x * relCTM.a;
        const y = relCTM.f + bbox.y * relCTM.d;
        shapes.push({
          cx: x + (bbox.width * Math.abs(relCTM.a)) / 2,
          cy: y + (bbox.height * Math.abs(relCTM.d)) / 2,
          height: bbox.height * Math.abs(relCTM.d),
          rx: rx * Math.abs(relCTM.a),
          ry: ry * Math.abs(relCTM.d),
          width: bbox.width * Math.abs(relCTM.a),
          x,
          y
        });
      } else {
        shapes.push({
          cx: bbox.x + bbox.width / 2,
          cy: bbox.y + bbox.height / 2,
          height: bbox.height,
          rx,
          ry,
          width: bbox.width,
          x: bbox.x,
          y: bbox.y
        });
      }
    } catch {
      // getBBox/getCTM may fail for hidden/detached elements
    }
  });
  return shapes;
}

/**
 * Trim an SVG path so its start/end points stop at node borders
 * instead of penetrating inside the node rect.
 */
function trimPathAtNodeBorders(path: SVGPathElement, nodeShapes: NodeShapeBounds[]): void {
  try {
    const pathLen = path.getTotalLength();
    if (pathLen === 0) return;

    const startPt = path.getPointAtLength(0);
    const endPt = path.getPointAtLength(pathLen);

    const svg = path.ownerSVGElement;
    if (!svg) return;
    const pathCTM = path.getCTM();
    const svgCTM = svg.getCTM();
    if (!pathCTM || !svgCTM) return;
    const relCTM = svgCTM.inverse().multiply(pathCTM);

    const startX = relCTM.e + startPt.x * relCTM.a + startPt.y * relCTM.c;
    const startY = relCTM.f + startPt.x * relCTM.b + startPt.y * relCTM.d;
    const endX = relCTM.e + endPt.x * relCTM.a + endPt.y * relCTM.c;
    const endY = relCTM.f + endPt.x * relCTM.b + endPt.y * relCTM.d;

    const startNode = findContainingNode(startX, startY, nodeShapes);
    const endNode = findContainingNode(endX, endY, nodeShapes);

    if (!startNode && !endNode) return;

    const INSET = 2; // 2px inset from border for clean visual gap
    let trimStart = 0;
    let trimEnd = pathLen;

    if (startNode) {
      trimStart = findBorderIntersection(path, 0, pathLen / 2, startNode, relCTM, INSET, true);
    }
    if (endNode) {
      trimEnd = findBorderIntersection(path, pathLen / 2, pathLen, endNode, relCTM, INSET, false);
    }

    if (trimStart > 0.5 || pathLen - trimEnd > 0.5) {
      rebuildTrimmedPath(path, trimStart, trimEnd);
    }
  } catch {
    // If path manipulation fails, leave path unchanged
  }
}

/** Check if a point is inside any node shape's bounding rect */
function findContainingNode(
  px: number,
  py: number,
  nodes: NodeShapeBounds[]
): NodeShapeBounds | null {
  for (const node of nodes) {
    const { x, y, width, height } = node;
    if (px >= x && px <= x + width && py >= y && py <= y + height) {
      return node;
    }
  }
  return null;
}

/**
 * Binary search along the path to find where it crosses the node border.
 * Returns the path length at the border intersection point.
 */
function findBorderIntersection(
  path: SVGPathElement,
  searchStart: number,
  searchEnd: number,
  node: NodeShapeBounds,
  relCTM: DOMMatrix,
  inset: number,
  fromStart: boolean
): number {
  const PRECISION = 0.5;
  let lo = searchStart;
  let hi = searchEnd;

  for (let i = 0; i < 20 && hi - lo > PRECISION; i++) {
    const mid = (lo + hi) / 2;
    const pt = path.getPointAtLength(mid);
    const mx = relCTM.e + pt.x * relCTM.a + pt.y * relCTM.c;
    const my = relCTM.f + pt.x * relCTM.b + pt.y * relCTM.d;

    const inside = isInsideRoundedRect(mx, my, node, inset);

    if (fromStart) {
      if (inside) lo = mid;
      else hi = mid;
    } else {
      if (inside) hi = mid;
      else lo = mid;
    }
  }

  return fromStart ? hi : lo;
}

/** Check if point is inside a rounded rectangle, with optional inset */
function isInsideRoundedRect(
  px: number,
  py: number,
  node: NodeShapeBounds,
  inset: number
): boolean {
  const { x, y, width, height, rx, ry } = node;
  const nx = x + inset;
  const ny = y + inset;
  const nw = width - 2 * inset;
  const nh = height - 2 * inset;
  const nrx = Math.max(0, rx - inset);
  const nry = Math.max(0, ry - inset);

  if (px < nx || px > nx + nw || py < ny || py > ny + nh) return false;

  // Check rounded corners via ellipse equation
  const corners = [
    { cx: nx + nrx, cy: ny + nry },
    { cx: nx + nw - nrx, cy: ny + nry },
    { cx: nx + nrx, cy: ny + nh - nry },
    { cx: nx + nw - nrx, cy: ny + nh - nry }
  ];

  for (const corner of corners) {
    const dx = px - corner.cx;
    const dy = py - corner.cy;
    const inCornerX = corner.cx < nx + nw / 2 ? px < corner.cx : px > corner.cx;
    const inCornerY = corner.cy < ny + nh / 2 ? py < corner.cy : py > corner.cy;
    if (inCornerX && inCornerY) {
      if ((dx * dx) / (nrx * nrx) + (dy * dy) / (nry * nry) > 1) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Rebuild a path by sampling points between trimStart and trimEnd,
 * replacing the original 'd' attribute with a smooth polyline approximation.
 */
function rebuildTrimmedPath(path: SVGPathElement, trimStart: number, trimEnd: number): void {
  const totalLen = trimEnd - trimStart;
  if (totalLen <= 0) return;

  const numPoints = Math.max(8, Math.ceil(totalLen / 4));
  const step = totalLen / numPoints;
  const points: string[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = trimStart + i * step;
    const pt = path.getPointAtLength(Math.min(t, trimEnd));
    if (i === 0) {
      points.push(`M${pt.x.toFixed(2)},${pt.y.toFixed(2)}`);
    } else {
      points.push(`L${pt.x.toFixed(2)},${pt.y.toFixed(2)}`);
    }
  }

  path.setAttribute('d', points.join(' '));
}

/**
 * ER diagrams: create inverted clip paths from entity boxes to mask
 * any relationship line segments that penetrate inside entity boxes.
 */
function clipERRelationshipLines(svg: SVGSVGElement, defs: SVGDefsElement): void {
  const entityBoxes = svg.querySelectorAll<SVGRectElement>('.entityBox');
  if (entityBoxes.length === 0) return;

  const clipId = 'er-entity-clip';
  if (defs.querySelector(`#${clipId}`)) return;

  const clipPath = document.createElementNS(SVG_NS, 'clipPath');
  clipPath.setAttribute('id', clipId);

  try {
    const svgBBox = svg.getBBox();
    const padding = 100;
    const bgRect = document.createElementNS(SVG_NS, 'rect');
    bgRect.setAttribute('x', String(svgBBox.x - padding));
    bgRect.setAttribute('y', String(svgBBox.y - padding));
    bgRect.setAttribute('width', String(svgBBox.width + 2 * padding));
    bgRect.setAttribute('height', String(svgBBox.height + 2 * padding));
    bgRect.setAttribute('fill', 'white');
    clipPath.appendChild(bgRect);

    // Subtract entity box interiors (clip-rule: evenodd)
    entityBoxes.forEach((box) => {
      const clone = box.cloneNode(true) as SVGRectElement;
      clone.setAttribute('fill', 'black');
      const inset = 1;
      const bx = parseFloat(box.getAttribute('x') ?? '0') + inset;
      const by = parseFloat(box.getAttribute('y') ?? '0') + inset;
      const bw = parseFloat(box.getAttribute('width') ?? '0') - 2 * inset;
      const bh = parseFloat(box.getAttribute('height') ?? '0') - 2 * inset;
      clone.setAttribute('x', String(bx));
      clone.setAttribute('y', String(by));
      clone.setAttribute('width', String(bw));
      clone.setAttribute('height', String(bh));
      clipPath.appendChild(clone);
    });

    clipPath.setAttribute('clip-rule', 'evenodd');
    defs.appendChild(clipPath);

    const relLines = svg.querySelectorAll<SVGPathElement>('path.er.relationshipLine');
    relLines.forEach((line) => {
      line.setAttribute('clip-path', `url(#${clipId})`);
    });
  } catch {
    // getBBox may fail
  }
}

/**
 * Class diagrams: create inverted clip paths from classGroup rects to mask
 * any relation line segments that penetrate inside class boxes.
 * Same approach as ER clip paths but targets classGroup elements.
 */
function clipClassRelationLines(svg: SVGSVGElement, defs: SVGDefsElement): void {
  const classBoxes = svg.querySelectorAll<SVGRectElement>('g.classGroup rect');
  if (classBoxes.length === 0) return;

  const clipId = 'class-box-clip';
  if (defs.querySelector(`#${clipId}`)) return;

  const clipPath = document.createElementNS(SVG_NS, 'clipPath');
  clipPath.setAttribute('id', clipId);

  try {
    const svgBBox = svg.getBBox();
    const padding = 100;
    const bgRect = document.createElementNS(SVG_NS, 'rect');
    bgRect.setAttribute('x', String(svgBBox.x - padding));
    bgRect.setAttribute('y', String(svgBBox.y - padding));
    bgRect.setAttribute('width', String(svgBBox.width + 2 * padding));
    bgRect.setAttribute('height', String(svgBBox.height + 2 * padding));
    bgRect.setAttribute('fill', 'white');
    clipPath.appendChild(bgRect);

    // Subtract class box interiors (clip-rule: evenodd)
    // Only use the main class rect (first rect in each classGroup)
    const seenGroups = new Set<Element>();
    classBoxes.forEach((box) => {
      const group = box.closest('g.classGroup');
      if (!group || seenGroups.has(group)) return;
      seenGroups.add(group);

      try {
        // Use the group's bounding box for accurate position
        const groupBBox = group.getBBox();
        const ctm = group.getCTM();
        const svgCTM = svg.getCTM();

        let bx: number, by: number, bw: number, bh: number;
        if (ctm && svgCTM) {
          const relCTM = svgCTM.inverse().multiply(ctm);
          bx = relCTM.e + groupBBox.x * relCTM.a;
          by = relCTM.f + groupBBox.y * relCTM.d;
          bw = groupBBox.width * Math.abs(relCTM.a);
          bh = groupBBox.height * Math.abs(relCTM.d);
        } else {
          bx = groupBBox.x;
          by = groupBBox.y;
          bw = groupBBox.width;
          bh = groupBBox.height;
        }

        const brx = parseFloat(box.getAttribute('rx') ?? '16');
        const bry = parseFloat(box.getAttribute('ry') ?? '16');

        // Shrink by 1px to keep border stroke visible
        const inset = 1;
        const clipRect = document.createElementNS(SVG_NS, 'rect');
        clipRect.setAttribute('x', String(bx + inset));
        clipRect.setAttribute('y', String(by + inset));
        clipRect.setAttribute('width', String(bw - 2 * inset));
        clipRect.setAttribute('height', String(bh - 2 * inset));
        clipRect.setAttribute('rx', String(brx));
        clipRect.setAttribute('ry', String(bry));
        clipRect.setAttribute('fill', 'black');
        clipPath.appendChild(clipRect);
      } catch {
        // getBBox may fail
      }
    });

    if (clipPath.children.length <= 1) return; // only background rect, no class boxes found

    clipPath.setAttribute('clip-rule', 'evenodd');
    defs.appendChild(clipPath);

    // Apply clip to relation lines in class diagrams
    const relationLines = svg.querySelectorAll<SVGPathElement>('path.relation, line.relation');
    relationLines.forEach((line) => {
      line.setAttribute('clip-path', `url(#${clipId})`);
    });
  } catch {
    // getBBox may fail
  }
}

/**
 * Ensure correct paint order per diagram type:
 *
 * Flowchart/State: nodes paint ABOVE edges (path trimming handles the gap),
 *   hiding any residual edge penetration.
 *
 * Class/ER: edges paint ABOVE nodes so arrowheads and relation lines
 *   aren't hidden behind class boxes. Path trimming + ER clip paths
 *   handle the penetration instead.
 *
 * Edge labels always paint last (above everything).
 */
function ensureNodesPaintAboveEdges(svg: SVGSVGElement): void {
  // --- Flowchart: .nodes group should paint after .edgePaths ---
  const flowchartNodeGroups = svg.querySelectorAll<SVGGElement>('.nodes');
  flowchartNodeGroups.forEach((group) => {
    const parent = group.parentElement;
    if (parent) {
      parent.appendChild(group);
    }
  });

  // --- Class diagram: relation lines must paint ABOVE classGroup boxes ---
  // Mermaid renders g.classGroup and .relation as siblings; move relations last
  const relationLines = svg.querySelectorAll<SVGElement>(
    'g[id^="classid-"], line.relation, path.relation, defs + g > line[class="relation"]'
  );
  // Also select the <g> containers that wrap relation paths in class diagrams
  const relationGroups = svg.querySelectorAll<SVGGElement>(
    'g.edgePath[id*="classid"], g[id^="edge"]'
  );

  // Move individual relation elements to end of parent
  relationLines.forEach((el) => {
    const parent = el.parentElement;
    if (parent && parent.querySelector('.classGroup')) {
      parent.appendChild(el);
    }
  });

  // Move relation groups to end of parent (above classGroup nodes)
  relationGroups.forEach((group) => {
    const parent = group.parentElement;
    if (parent && parent.querySelector('.classGroup')) {
      parent.appendChild(group);
    }
  });

  // --- Edge labels always paint last (above both edges and nodes) ---
  const edgeLabelGroups = svg.querySelectorAll<SVGGElement>('.edgeLabels');
  edgeLabelGroups.forEach((group) => {
    const parent = group.parentElement;
    if (parent) {
      parent.appendChild(group);
    }
  });
}
