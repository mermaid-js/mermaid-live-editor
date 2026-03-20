/**
 * SVG post-processing engine for ultra-clean diagram styling.
 * Runs after mermaid renders the SVG, before pan/zoom is applied.
 *
 * Covers ALL 9 target diagram types uniformly:
 * Flowchart, Sequence, Class, Use Case, Activity, State, Component, Deployment, ER.
 *
 * Orchestrates modular sub-processors:
 * - svg-defs-injector: shadow filters, arrowhead markers, gradients, fonts
 * - svg-node-enhancer: border-radius enforcement, shadow application
 * - svg-edge-enhancer: gradient strokes, arrowhead replacement, marching ants, label elevation
 * - svg-edge-clipper: edge clipping at node borders to prevent line penetration
 */

import { DEFAULT_DARK_GRADIENT, DEFAULT_LIGHT_GRADIENT } from './svg-post-processor-types';
import {
  getOrCreateDefs,
  injectShadowFilter,
  injectHollowArrowMarker,
  injectGradientDef,
  injectFontFaces,
  fixClassDiagramMarkers
} from './svg-defs-injector';
import { refineBorderRadius, enhanceNodeShadows } from './svg-node-enhancer';
import {
  addGradientArrows,
  replaceArrowheadMarkers,
  addMarchingAntsAnimation,
  elevateEdgeLabels
} from './svg-edge-enhancer';
import { clipEdgesAtNodeBorders } from './svg-edge-clipper';

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
  const colors = gradientColors
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
  fixClassDiagramMarkers(svg);
  addMarchingAntsAnimation(svg);
  elevateEdgeLabels(svg);
  clipEdgesAtNodeBorders(svg, defs);
  injectFontFaces(svg);
}
