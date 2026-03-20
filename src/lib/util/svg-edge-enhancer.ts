/**
 * Edge-level SVG enhancements — gradient strokes, arrowhead replacement,
 * marching-ants animation, and edge label elevation.
 */

import { SVG_NS, type GradientColors } from './svg-post-processor-types';

/**
 * Apply subtle gradient stroke to ALL connector lines.
 * Covers: flowchart links, sequence messages, state transitions,
 * class relations, ER relationship lines.
 */
export function addGradientArrows(
  svg: SVGSVGElement,
  defs: SVGDefsElement,
  colors: GradientColors
): void {
  const linkSelectors = [
    '.flowchart-link',
    '.edge-pattern-solid',
    '.messageLine0',
    '.messageLine1',
    '.relation',
    '.transition',
    'path.er.relationshipLine'
  ].join(', ');

  const links = svg.querySelectorAll<SVGPathElement>(linkSelectors);
  if (links.length === 0) return;

  // Compute bounding box of all links to orient the gradient along flow
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  links.forEach((link) => {
    try {
      const bbox = link.getBBox();
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
    } catch {
      // getBBox may fail for hidden elements
    }
  });

  // Update gradient coordinates to span the full diagram flow
  const gradient = defs.querySelector('#arrow-gradient');
  if (gradient && isFinite(minX)) {
    gradient.setAttribute('x1', String(minX));
    gradient.setAttribute('y1', String(minY));
    gradient.setAttribute('x2', String(maxX));
    gradient.setAttribute('y2', String(maxY));
  }

  // Apply gradient stroke to each link
  const fallbackColor = colors.start;
  links.forEach((link) => {
    try {
      link.setAttribute('stroke', 'url(#arrow-gradient)');
    } catch {
      link.setAttribute('stroke', fallbackColor);
    }
  });
}

/**
 * Replace default filled arrowheads with hollow modern style.
 * Applied across all diagram types that use marker-end.
 */
export function replaceArrowheadMarkers(svg: SVGSVGElement): void {
  const paths = svg.querySelectorAll<SVGElement>('[marker-end]');
  paths.forEach((path) => {
    const existing = path.getAttribute('marker-end');
    // Replace mermaid's default flowchart/state markers
    if (existing && (existing.includes('flowchart-') || existing.includes('stateDiagram-'))) {
      path.setAttribute('marker-end', 'url(#hollow-arrow)');
    }
  });
}

/** Add marching-ants animation to dashed/dotted links across all diagram types */
export function addMarchingAntsAnimation(svg: SVGSVGElement): void {
  const dashedLinks = svg.querySelectorAll<SVGPathElement>(
    '.edge-pattern-dotted, .edge-pattern-dashed, .loopLine, [stroke-dasharray]'
  );

  dashedLinks.forEach((link) => {
    // Skip if already animated or if it's a cluster border
    if (link.querySelector('animate')) return;
    if (link.closest('.cluster')) return;

    link.setAttribute('stroke-dasharray', '8 4');
    link.setAttribute('stroke-width', '2');

    const animate = document.createElementNS(SVG_NS, 'animate');
    animate.setAttribute('attributeName', 'stroke-dashoffset');
    animate.setAttribute('values', '0;-24');
    animate.setAttribute('dur', '1.5s');
    animate.setAttribute('repeatCount', 'indefinite');
    link.appendChild(animate);
  });
}

/**
 * Elevate edge label groups above connector lines so text is readable.
 * Makes label background rects transparent (mermaid's edgeLabelBackground handles fill).
 * Re-appends labels as last children so they paint on top of connector paths.
 */
export function elevateEdgeLabels(svg: SVGSVGElement): void {
  // Make edge label background rects transparent — no opaque blocks
  const labelRects = svg.querySelectorAll<SVGRectElement>('.edgeLabel rect, .labelBkg');
  labelRects.forEach((rect) => {
    rect.setAttribute('fill', 'transparent');
    rect.setAttribute('opacity', '0');
    rect.style.opacity = '0';
  });

  // Move edgeLabel groups to end of their parent so they paint on top of paths
  const edgeLabels = svg.querySelectorAll<SVGGElement>('.edgeLabel');
  edgeLabels.forEach((label) => {
    const parent = label.parentElement;
    if (parent) {
      parent.appendChild(label);
    }
  });

  // Sequence diagram: ensure message text sits above message lines
  const messageTexts = svg.querySelectorAll<SVGTextElement>('.messageText');
  messageTexts.forEach((text) => {
    const parent = text.parentElement;
    if (parent) {
      parent.appendChild(text);
    }
  });
}
