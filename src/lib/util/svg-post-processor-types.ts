/**
 * Shared types and constants for the SVG post-processor modules.
 */

export const SVG_NS = 'http://www.w3.org/2000/svg';

/** Gradient colors for arrow strokes — parameterized per theme */
export interface GradientColors {
  end: string;
  start: string;
}

export const DEFAULT_LIGHT_GRADIENT: GradientColors = { end: '#00B4DB', start: '#0052CC' };
export const DEFAULT_DARK_GRADIENT: GradientColors = { end: '#60A5FA', start: '#3B82F6' };

/** Unified border-radius for all diagram element shapes */
export const NODE_BORDER_RADIUS = 16;
export const NOTE_BORDER_RADIUS = 12;

/** Bounding data for a single node shape */
export interface NodeShapeBounds {
  cx: number;
  cy: number;
  height: number;
  rx: number;
  ry: number;
  width: number;
  x: number;
  y: number;
}
