/**
 * SVG <defs> injection — shadow filters, arrowhead markers, gradient definitions.
 * Used by the SVG post-processor to inject reusable SVG definitions.
 */

import { SVG_NS, type GradientColors } from './svg-post-processor-types';

/** Get existing <defs> or create one */
export function getOrCreateDefs(svg: SVGSVGElement): SVGDefsElement {
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.prepend(defs);
  }
  return defs;
}

/** Dual-layer shadow filter — parameterized per theme */
export function injectShadowFilter(
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

/** Hollow modern arrowhead — open chevron, no fill. overflow:visible prevents clipping by node rects */
export function injectHollowArrowMarker(
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
  marker.setAttribute('markerWidth', '12');
  marker.setAttribute('markerHeight', '12');
  marker.setAttribute('orient', 'auto-start-reverse');
  marker.setAttribute('overflow', 'visible');
  marker.innerHTML = `<path d="M 2 2 L 10 6 L 2 10" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  defs.appendChild(marker);
}

/** Shared linear gradient for arrow strokes (source -> destination color) */
export function injectGradientDef(defs: SVGDefsElement, colors: GradientColors): void {
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

/** Inject font-face declarations for SVG export portability */
export function injectFontFaces(svg: SVGSVGElement): void {
  if (svg.querySelector('style[data-sotatek-fonts]')) return;

  const style = document.createElementNS(SVG_NS, 'style');
  style.setAttribute('data-sotatek-fonts', 'true');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap');
  `;
  svg.prepend(style);
}

/**
 * Fix Class diagram relationship markers (diamonds, arrows, dependencies)
 * so they snap to the outer border of nodes instead of bleeding inside.
 *
 * Mermaid v11 prefixes marker IDs: `{svgId}_class-compositionStart` etc.
 * We find them by substring match rather than exact ID.
 *
 * Mermaid's default marker refX values assume sharp-cornered rects.
 * With rx:16 rounded corners, the visible border curves inward, so
 * markers must be pushed outward to compensate.
 *
 * Also sets overflow:visible so markers aren't clipped by parent elements.
 */
export function fixClassDiagramMarkers(svg: SVGSVGElement): void {
  // Mermaid v11 generates IDs like "graph-2_class-compositionStart"
  // Match by suffix: IDs ending with these marker type names
  const markerSuffixes = [
    'compositionStart',
    'compositionEnd',
    'aggregationStart',
    'aggregationEnd',
    'dependencyStart',
    'dependencyEnd',
    'extensionStart',
    'extensionEnd',
    'lollipopStart',
    'lollipopEnd'
  ];

  // Mermaid v11 scatters markers across multiple <defs> elements, so query from SVG root
  const allMarkers = svg.querySelectorAll<SVGMarkerElement>('defs marker');
  // Additional px to push marker away from node center for rounded corners
  const OUTWARD_OFFSET = 5;

  allMarkers.forEach((marker) => {
    const id = marker.id;
    const matchedSuffix = markerSuffixes.find((s) => id.endsWith(s));
    if (!matchedSuffix) return;

    // Ensure markers paint outside clipped regions
    marker.setAttribute('overflow', 'visible');

    // Adjust refX to account for rounded corners
    const currentRefX = parseFloat(marker.getAttribute('refX') ?? '0');
    if (matchedSuffix.endsWith('End')) {
      // End markers: increase refX to push tip further from node center
      marker.setAttribute('refX', String(currentRefX + OUTWARD_OFFSET));
    } else {
      // Start markers: decrease refX to push tip further from node center
      marker.setAttribute('refX', String(Math.max(0, currentRefX - OUTWARD_OFFSET)));
    }
  });
}
