/**
 * SVG post-processing engine for ultra-clean diagram styling.
 * Runs after mermaid renders the SVG, before pan/zoom is applied.
 *
 * Covers ALL 9 target diagram types uniformly:
 * Flowchart, Sequence, Class, Use Case, Activity, State, Component, Deployment, ER.
 *
 * Adds: gradient arrows, hollow arrowheads, marching-ants animation,
 * enhanced shadow filters, border-radius enforcement, and font injection.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** SotaTek gradient colors for arrow strokes — parameterized per theme */
interface GradientColors {
  start: string;
  end: string;
}

const DEFAULT_LIGHT_GRADIENT: GradientColors = { start: '#0052CC', end: '#00B4DB' };
const DEFAULT_DARK_GRADIENT: GradientColors = { start: '#3B82F6', end: '#60A5FA' };

/** Unified border-radius for all diagram element shapes */
const NODE_BORDER_RADIUS = 16;
const NOTE_BORDER_RADIUS = 12;

/**
 * Main entry point — applies all post-processing to the rendered SVG.
 * Skipped for rough mode (svg2roughjs replaces the SVG entirely).
 */
export function postProcessDiagramSvg(
  svg: SVGSVGElement,
  isDark: boolean,
  gradientColors?: {
    gradientStart: string;
    gradientEnd: string;
    shadowInnerColor?: string;
    shadowOuterColor?: string;
    hollowArrowColor?: string;
  }
): void {
  const defs = getOrCreateDefs(svg);
  const colors: GradientColors = gradientColors
    ? { start: gradientColors.gradientStart, end: gradientColors.gradientEnd }
    : isDark
      ? DEFAULT_DARK_GRADIENT
      : DEFAULT_LIGHT_GRADIENT;

  // Inject reusable SVG definitions
  injectShadowFilter(
    defs,
    isDark,
    gradientColors?.shadowInnerColor,
    gradientColors?.shadowOuterColor
  );
  injectHollowArrowMarker(defs, isDark, gradientColors?.hollowArrowColor);
  injectGradientDef(defs, colors);

  // Apply enhancements uniformly across all diagram types
  refineBorderRadius(svg);
  enhanceNodeShadows(svg);
  addGradientArrows(svg, defs, colors);
  replaceArrowheadMarkers(svg);
  addMarchingAntsAnimation(svg);
  injectFontFaces(svg);
}

/** Get existing <defs> or create one */
function getOrCreateDefs(svg: SVGSVGElement): SVGDefsElement {
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.prepend(defs);
  }
  return defs;
}

/** Dual-layer shadow filter — parameterized per theme */
function injectShadowFilter(
  defs: SVGDefsElement,
  isDark: boolean,
  customInnerColor?: string,
  customOuterColor?: string
): void {
  if (defs.querySelector('#sotatek-shadow')) return;

  const innerColor = customInnerColor ?? (isDark ? 'rgba(59,130,246,0.20)' : 'rgba(0,82,204,0.12)');
  const outerColor = customOuterColor ?? (isDark ? 'rgba(10,25,47,0.40)' : 'rgba(0,82,204,0.06)');
  // Deeper blur values when custom colors provided (theme-specific shadow depth)
  const innerDy = customInnerColor ? '4' : '1';
  const innerStd = customInnerColor ? '6' : '1';
  const outerDy = customOuterColor ? '20' : '3';
  const outerStd = customOuterColor ? '20' : '6';

  const filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', 'sotatek-shadow');
  filter.setAttribute('x', '-15%');
  filter.setAttribute('y', '-15%');
  filter.setAttribute('width', '130%');
  filter.setAttribute('height', '140%');
  filter.innerHTML = `
    <feDropShadow dx="0" dy="${innerDy}" stdDeviation="${innerStd}" flood-color="${innerColor}" flood-opacity="1"/>
    <feDropShadow dx="0" dy="${outerDy}" stdDeviation="${outerStd}" flood-color="${outerColor}" flood-opacity="1"/>
  `;
  defs.appendChild(filter);
}

/** Hollow modern arrowhead — open chevron, no fill */
function injectHollowArrowMarker(
  defs: SVGDefsElement,
  isDark: boolean,
  customColor?: string
): void {
  if (defs.querySelector('#hollow-arrow')) return;

  const color = customColor ?? (isDark ? '#60A5FA' : '#0052CC');
  const marker = document.createElementNS(SVG_NS, 'marker');
  marker.setAttribute('id', 'hollow-arrow');
  marker.setAttribute('viewBox', '0 0 12 12');
  marker.setAttribute('refX', '10');
  marker.setAttribute('refY', '6');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '10');
  marker.setAttribute('orient', 'auto-start-reverse');
  marker.innerHTML = `<path d="M 2 2 L 10 6 L 2 10" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  defs.appendChild(marker);
}

/** Shared linear gradient for arrow strokes (source -> destination color) */
function injectGradientDef(defs: SVGDefsElement, colors: GradientColors): void {
  if (defs.querySelector('#arrow-gradient')) return;

  const gradient = document.createElementNS(SVG_NS, 'linearGradient');
  gradient.setAttribute('id', 'arrow-gradient');
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
  gradient.innerHTML = `
    <stop offset="0%" stop-color="${colors.start}"/>
    <stop offset="100%" stop-color="${colors.end}"/>
  `;
  defs.appendChild(gradient);
}

/**
 * Enforce unified border-radius on ALL diagram element rects.
 * Covers: flowchart nodes, state groups, class boxes, ER entities,
 * sequence actors, clusters, notes, composite states.
 */
function refineBorderRadius(svg: SVGSVGElement): void {
  // Primary elements — 16px radius
  const primaryRects = svg.querySelectorAll(
    '.node rect, .cluster rect, .stateGroup rect, .actor, g.classGroup rect, .composit, .entityBox'
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
function enhanceNodeShadows(svg: SVGSVGElement): void {
  const selectors = [
    // Flowchart / Use Case / Activity / Component / Deployment
    '.node rect',
    '.node polygon',
    '.node circle',
    '.node ellipse',
    // Sequence diagram
    '.actor',
    // Class diagram
    'g.classGroup rect',
    // State diagram
    '.stateGroup rect',
    // ER diagram
    '.entityBox'
  ].join(', ');

  const elements = svg.querySelectorAll(selectors);
  elements.forEach((el) => {
    if (!el.getAttribute('filter')) {
      el.setAttribute('filter', 'url(#sotatek-shadow)');
    }
  });
}

/**
 * Apply subtle gradient stroke to ALL connector lines.
 * Covers: flowchart links, sequence messages, state transitions,
 * class relations, ER relationship lines.
 */
function addGradientArrows(svg: SVGSVGElement, defs: SVGDefsElement, colors: GradientColors): void {
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
function replaceArrowheadMarkers(svg: SVGSVGElement): void {
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
function addMarchingAntsAnimation(svg: SVGSVGElement): void {
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

/** Inject font-face declarations for SVG export portability */
function injectFontFaces(svg: SVGSVGElement): void {
  if (svg.querySelector('style[data-sotatek-fonts]')) return;

  const style = document.createElementNS(SVG_NS, 'style');
  style.setAttribute('data-sotatek-fonts', 'true');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap');
  `;
  svg.prepend(style);
}
