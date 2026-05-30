/**
 * edge-path.ts — Pure SVG Geometry & Edge Routing Library
 *
 * All functions are stateless.  The only side-effecting export is
 * `updateEdgePath`, which mutates the provided DOM elements.
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type BoundarySide = 'left' | 'right' | 'top' | 'bottom';
export type ShapeType = 'rect' | 'diamond';

// ── Algorithm 1: Shape-Aware Boundary Intersection ──────────────────────

/**
 * Find the intersection of a ray (from shape centre → target point) with the
 * rectangle boundary (AABB).
 */
export function getRectEdgePoint(rect: Rect, toCx: number, toCy: number): Point {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const dx = toCx - cx;
  const dy = toCy - cy;

  if (dx === 0 && dy === 0) {
    return { x: cx, y: cy };
  }

  const hw = rect.width / 2;
  const hh = rect.height / 2;

  let t = Infinity;
  if (dx > 0) t = Math.min(t, hw / dx);
  if (dx < 0) t = Math.min(t, -hw / dx);
  if (dy > 0) t = Math.min(t, hh / dy);
  if (dy < 0) t = Math.min(t, -hh / dy);

  return { x: cx + t * dx, y: cy + t * dy };
}

/**
 * Find the intersection of a ray (from diamond centre → target point) with
 * the diamond boundary.
 *
 * A diamond is a convex polygon inscribed in the AABB, with vertices at the
 * midpoints of each edge: top=(cx, cy-hh), right=(cx+hw, cy),
 * bottom=(cx, cy+hh), left=(cx-hw, cy).
 *
 * The diamond surface is the L1-norm: |x-cx|/hw + |y-cy|/hh = 1.
 * For a ray from the centre: t = 1 / (|dx|/hw + |dy|/hh).
 */
function getDiamondEdgePoint(rect: Rect, toCx: number, toCy: number): Point {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const dx = toCx - cx;
  const dy = toCy - cy;

  if (dx === 0 && dy === 0) {
    return { x: cx, y: cy };
  }

  const hw = rect.width / 2;
  const hh = rect.height / 2;
  const t = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh);

  return { x: cx + t * dx, y: cy + t * dy };
}

/**
 * Shape-aware dispatcher: route to the correct intersection algorithm based
 * on the node's shape type.
 */
export function getShapeEdgePoint(
  rect: Rect,
  toCx: number,
  toCy: number,
  shapeType: ShapeType = 'rect'
): Point {
  if (shapeType === 'diamond') {
    return getDiamondEdgePoint(rect, toCx, toCy);
  }
  return getRectEdgePoint(rect, toCx, toCy);
}

// ── Boundary Side Classification ──────────────────────────────────────────

export function getBoundarySide(rect: Rect, px: number, py: number): BoundarySide {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const hw = rect.width / 2;
  const hh = rect.height / 2;

  const nx = Math.abs(px - cx) / hw;
  const ny = Math.abs(py - cy) / hh;

  if (nx > ny) {
    return px > cx ? 'right' : 'left';
  }
  return py > cy ? 'bottom' : 'top';
}

// ── Side Normal ───────────────────────────────────────────────────────────

function sideNormal(side: BoundarySide): Point {
  switch (side) {
    case 'right':
      return { x: 1, y: 0 };
    case 'left':
      return { x: -1, y: 0 };
    case 'bottom':
      return { x: 0, y: 1 };
    case 'top':
      return { x: 0, y: -1 };
  }
}

// ── Algorithm 2: Edge Re-routing ──────────────────────────────────────────

const OFFSET_RATIO = 0.4;

export function updateEdgePath(
  srcRect: Rect,
  tgtRect: Rect,
  pathEl: SVGPathElement,
  labelEl?: SVGGElement | null,
  srcShape: ShapeType = 'rect',
  tgtShape: ShapeType = 'rect'
): void {
  const srcCx = srcRect.x + srcRect.width / 2;
  const srcCy = srcRect.y + srcRect.height / 2;
  const tgtCx = tgtRect.x + tgtRect.width / 2;
  const tgtCy = tgtRect.y + tgtRect.height / 2;

  // Boundary intersection points — shape-aware
  const start = getShapeEdgePoint(srcRect, tgtCx, tgtCy, srcShape);
  const end = getShapeEdgePoint(tgtRect, srcCx, srcCy, tgtShape);
  const srcSide = getBoundarySide(srcRect, start.x, start.y);
  const tgtSide = getBoundarySide(tgtRect, end.x, end.y);

  // Control-point offset
  const dx = tgtCx - srcCx;
  const dy = tgtCy - srcCy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = dist * OFFSET_RATIO;

  const n1 = sideNormal(srcSide);
  const n2 = sideNormal(tgtSide);

  const cp1: Point = { x: start.x + n1.x * offset, y: start.y + n1.y * offset };
  const cp2: Point = { x: end.x + n2.x * offset, y: end.y + n2.y * offset };

  pathEl.setAttribute(
    'd',
    `M ${start.x},${start.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${end.x},${end.y}`
  );

  if (labelEl) {
    positionEdgeLabel(pathEl, labelEl);
  }
}

// ── Edge Label Repositioning ──────────────────────────────────────────────

function positionEdgeLabel(pathEl: SVGPathElement, labelEl: SVGGElement): void {
  try {
    const len = pathEl.getTotalLength();
    if (len === 0) return;
    const mid = pathEl.getPointAtLength(len / 2);

    // Map midpoint from path's coordinate space into the label's parent space
    // via screen CTM, so the translate lands correctly even when path and
    // label live in different <g> containers with their own transforms.
    const labelParent = labelEl.parentElement as SVGGraphicsElement | null;
    if (labelParent && labelParent.getScreenCTM) {
      const pathCTM = pathEl.getScreenCTM();
      const parentCTM = labelParent.getScreenCTM();
      if (pathCTM && parentCTM) {
        const svg = pathEl.ownerSVGElement;
        if (svg) {
          const pt = svg.createSVGPoint();
          pt.x = mid.x;
          pt.y = mid.y;
          const screenPt = pt.matrixTransform(pathCTM);
          const finalPt = screenPt.matrixTransform(parentCTM.inverse());
          labelEl.setAttribute(
            'transform',
            `translate(${finalPt.x.toFixed(1)}, ${finalPt.y.toFixed(1)})`
          );
          return;
        }
      }
    }

    // Fallback: assume same coordinate space
    labelEl.setAttribute('transform', `translate(${mid.x.toFixed(1)}, ${mid.y.toFixed(1)})`);
  } catch {
    // path not renderable yet
  }
}
