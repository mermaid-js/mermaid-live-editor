/**
 * SVG post-processing engine for ultra-modern diagram styling.
 * Runs after mermaid renders the SVG, before pan/zoom is applied.
 * Adds: gradient arrows, hollow arrowheads, marching-ants animation,
 * enhanced shadow filters, border-radius enforcement, and font injection.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** SotaTek gradient colors */
const LIGHT_GRADIENT = { start: '#0052CC', end: '#00B4DB' };
const DARK_GRADIENT = { start: '#3B82F6', end: '#60A5FA' };

/**
 * Main entry point — applies all post-processing to the rendered SVG.
 * Call after container.innerHTML = svg and before pan/zoom setup.
 * Skipped for rough mode (svg2roughjs replaces the SVG entirely).
 */
export function postProcessDiagramSvg(svg: SVGSVGElement, isDark: boolean): void {
  const defs = getOrCreateDefs(svg);
  injectShadowFilter(defs, isDark);
  injectHollowArrowMarker(defs, isDark);
  injectDotMarker(defs, isDark);
  injectGradientDef(defs, isDark);

  enhanceNodeShadows(svg);
  refineBorderRadius(svg);
  addGradientArrows(svg, defs, isDark);
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

/** Dual-layer shadow filter — sharp inner stroke + soft outer blur */
function injectShadowFilter(defs: SVGDefsElement, isDark: boolean): void {
  if (defs.querySelector('#sotatek-shadow')) return;

  const shadowColor = isDark ? 'rgba(59,130,246,0.25)' : 'rgba(0,82,204,0.15)';
  const blurColor = isDark ? 'rgba(10,25,47,0.45)' : 'rgba(0,82,204,0.08)';

  const filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', 'sotatek-shadow');
  filter.setAttribute('x', '-20%');
  filter.setAttribute('y', '-20%');
  filter.setAttribute('width', '140%');
  filter.setAttribute('height', '140%');
  filter.innerHTML = `
    <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="${shadowColor}" flood-opacity="1"/>
    <feDropShadow dx="0" dy="4" stdDeviation="7.5" flood-color="${blurColor}" flood-opacity="1"/>
  `;
  defs.appendChild(filter);
}

/** Hollow modern arrowhead — open chevron, no fill */
function injectHollowArrowMarker(defs: SVGDefsElement, isDark: boolean): void {
  if (defs.querySelector('#hollow-arrow')) return;

  const color = isDark ? '#60A5FA' : '#0052CC';
  const marker = document.createElementNS(SVG_NS, 'marker');
  marker.setAttribute('id', 'hollow-arrow');
  marker.setAttribute('viewBox', '0 0 12 12');
  marker.setAttribute('refX', '10');
  marker.setAttribute('refY', '6');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '10');
  marker.setAttribute('orient', 'auto-start-reverse');
  marker.innerHTML = `<path d="M 1 1 L 10 6 L 1 11" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  defs.appendChild(marker);
}

/** Minimalist dot marker for endpoints */
function injectDotMarker(defs: SVGDefsElement, isDark: boolean): void {
  if (defs.querySelector('#dot-arrow')) return;

  const color = isDark ? '#60A5FA' : '#0052CC';
  const marker = document.createElementNS(SVG_NS, 'marker');
  marker.setAttribute('id', 'dot-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '5');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('orient', 'auto');
  marker.innerHTML = `<circle cx="5" cy="5" r="3" fill="${color}"/>`;
  defs.appendChild(marker);
}

/** Shared gradient for arrow strokes */
function injectGradientDef(defs: SVGDefsElement, isDark: boolean): void {
  if (defs.querySelector('#arrow-gradient')) return;

  const colors = isDark ? DARK_GRADIENT : LIGHT_GRADIENT;
  const gradient = document.createElementNS(SVG_NS, 'linearGradient');
  gradient.setAttribute('id', 'arrow-gradient');
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
  gradient.innerHTML = `
    <stop offset="0%" stop-color="${colors.start}"/>
    <stop offset="100%" stop-color="${colors.end}"/>
  `;
  defs.appendChild(gradient);
}

/** Apply shadow filter to node shapes */
function enhanceNodeShadows(svg: SVGSVGElement): void {
  const nodes = svg.querySelectorAll('.node rect, .node polygon, .node circle, .node ellipse');
  nodes.forEach((node) => {
    // Only apply if no filter is already set by themeCSS
    if (!node.getAttribute('filter')) {
      node.setAttribute('filter', 'url(#sotatek-shadow)');
    }
  });
}

/** Ensure border-radius on flowchart rects — fallback for themeCSS */
function refineBorderRadius(svg: SVGSVGElement): void {
  const rects = svg.querySelectorAll('.node rect, .cluster rect, .stateGroup rect');
  rects.forEach((rect) => {
    const rx = rect.getAttribute('rx');
    // Only set if not already rounded
    if (!rx || parseFloat(rx) < 4) {
      rect.setAttribute('rx', '12');
      rect.setAttribute('ry', '12');
    }
  });
}

/** Apply gradient stroke to flowchart links */
function addGradientArrows(svg: SVGSVGElement, defs: SVGDefsElement, isDark: boolean): void {
  const links = svg.querySelectorAll<SVGPathElement>(
    '.flowchart-link, .edge-pattern-solid, .messageLine0'
  );
  if (links.length === 0) return;

  // Compute bounding box of all links to orient the gradient
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

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

  // Update gradient coordinates based on overall flow direction
  const gradient = defs.querySelector('#arrow-gradient');
  if (gradient && isFinite(minX)) {
    gradient.setAttribute('x1', String(minX));
    gradient.setAttribute('y1', String(minY));
    gradient.setAttribute('x2', String(maxX));
    gradient.setAttribute('y2', String(maxY));
  }

  // Apply gradient stroke to each link
  const fallbackColor = isDark ? '#3B82F6' : '#0052CC';
  links.forEach((link) => {
    try {
      // Test if gradient works (element must be in DOM)
      link.setAttribute('stroke', 'url(#arrow-gradient)');
    } catch {
      link.setAttribute('stroke', fallbackColor);
    }
  });
}

/** Replace default filled arrowheads with hollow modern style */
function replaceArrowheadMarkers(svg: SVGSVGElement): void {
  // Find all paths that use marker-end
  const paths = svg.querySelectorAll<SVGElement>('[marker-end]');
  paths.forEach((path) => {
    const existing = path.getAttribute('marker-end');
    // Only replace mermaid's default flowchart markers, not all markers
    if (existing && existing.includes('flowchart-')) {
      path.setAttribute('marker-end', 'url(#hollow-arrow)');
    }
  });
}

/** Add marching-ants animation to dashed links */
function addMarchingAntsAnimation(svg: SVGSVGElement): void {
  const dashedLinks = svg.querySelectorAll<SVGPathElement>(
    '.edge-pattern-dotted, .edge-pattern-dashed, [stroke-dasharray]'
  );

  dashedLinks.forEach((link) => {
    // Skip if already animated
    if (link.querySelector('animate')) return;

    // Set consistent dash pattern
    link.setAttribute('stroke-dasharray', '8 4');
    link.setAttribute('stroke-width', '2');

    // Create animation element
    const animate = document.createElementNS(SVG_NS, 'animate');
    animate.setAttribute('attributeName', 'stroke-dashoffset');
    animate.setAttribute('values', '0;-24');
    animate.setAttribute('dur', '1.2s');
    animate.setAttribute('repeatCount', 'indefinite');
    link.appendChild(animate);
  });
}

/** Inject font-face declarations for SVG export portability */
function injectFontFaces(svg: SVGSVGElement): void {
  // Skip if already injected
  if (svg.querySelector('style[data-sotatek-fonts]')) return;

  const style = document.createElementNS(SVG_NS, 'style');
  style.setAttribute('data-sotatek-fonts', 'true');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap');
  `;
  svg.prepend(style);
}
