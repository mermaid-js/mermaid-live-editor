/**
 * Node-level SVG enhancements — border-radius enforcement and shadow application.
 * Applied uniformly across all diagram types after mermaid renders the SVG.
 */

import { NODE_BORDER_RADIUS, NOTE_BORDER_RADIUS } from './svg-post-processor-types';

/**
 * Enforce unified border-radius on ALL diagram element rects.
 * Covers: flowchart nodes, state groups, class boxes, ER entities,
 * sequence actors, clusters, notes, composite states.
 */
export function refineBorderRadius(svg: SVGSVGElement): void {
  // Primary elements — 16px radius
  const primaryRects = svg.querySelectorAll(
    '.node rect, .cluster rect, .stateGroup rect, .actor, .composit, .entityBox'
  );
  primaryRects.forEach((rect) => {
    const rx = rect.getAttribute('rx');
    if (!rx || parseFloat(rx) < NODE_BORDER_RADIUS) {
      rect.setAttribute('rx', String(NODE_BORDER_RADIUS));
      rect.setAttribute('ry', String(NODE_BORDER_RADIUS));
    }
  });

  // Secondary elements — 12px radius (notes, activation bars)
  const secondaryRects = svg.querySelectorAll('.note, .activation0, .activation1, .activation2');
  secondaryRects.forEach((rect) => {
    const rx = rect.getAttribute('rx');
    if (!rx || parseFloat(rx) < 6) {
      rect.setAttribute('rx', String(NOTE_BORDER_RADIUS));
      rect.setAttribute('ry', String(NOTE_BORDER_RADIUS));
    }
  });
}

/**
 * Apply shadow filter to all diagram node shapes uniformly.
 * Covers: flowchart nodes, state boxes, class boxes, ER entities, sequence actors.
 * Excludes: clusters (they stay flat as swimlanes).
 */
export function enhanceNodeShadows(svg: SVGSVGElement): void {
  const selectors = [
    '.node rect',
    '.node polygon',
    '.node circle',
    '.node ellipse',
    '.actor',
    '.stateGroup rect',
    '.entityBox'
  ].join(', ');

  const elements = svg.querySelectorAll(selectors);
  elements.forEach((el) => {
    if (!el.getAttribute('filter')) {
      el.setAttribute('filter', 'url(#sotatek-shadow)');
    }
  });

  // Mermaid v11 class diagram nodes use path-based .label-container (no rects).
  // Apply shadow to the first <path> (background fill) in each container.
  svg.querySelectorAll('.node .label-container').forEach((container) => {
    const nodeG = container.closest('.node');
    if (nodeG?.querySelector('rect')) return; // skip if already has rect
    const bgPath = container.querySelector('path');
    if (bgPath && !bgPath.getAttribute('filter')) {
      bgPath.setAttribute('filter', 'url(#sotatek-shadow)');
    }
  });
}
