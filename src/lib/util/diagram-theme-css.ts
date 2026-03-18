/**
 * CSS strings injected into mermaid SVGs via themeCSS config.
 * Unified design language across ALL 9 target diagram types:
 * Flowchart, Sequence, Class, Use Case, Activity, State, Component, Deployment, ER.
 *
 * Note: Use Case / Activity / Component / Deployment are flowchart variants in mermaid,
 * so flowchart selectors cover them. State and ER have their own dedicated selectors.
 *
 * Design: "Ultra-Clean Blueprint" — unified 16px rounded rects, generous spacing,
 * subtle shadows, clean connectors, metadata-style cluster labels.
 */

/** Shared CSS rules applied in both light and dark modes */
const sharedThemeCSS = `
/* ============================================================
   UNIVERSAL — applies to all diagram types
   ============================================================ */

/* Unified 16px rounded rectangles for all node shapes */
.node rect,
.node .label-container,
.stateGroup rect,
.entityBox,
.actor,
.note,
.cluster rect,
g.classGroup rect {
  rx: 16;
  ry: 16;
}

/* Typography — primary labels (semibold, 1.1em) */
.nodeLabel,
g.classGroup .title-text,
.stateGroup .state-title,
text.er.entityLabel,
.actor-man tspan,
.label text {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-weight: 600;
  font-size: 1.1em;
  line-height: 1.4;
}

/* Typography — secondary/metadata labels (regular, subdued) */
.edgeLabel,
.noteText,
.messageText,
.loopText,
.labelText {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-size: 0.85em;
  opacity: 0.7;
}

/* Typography — technical/monospace text */
.entityBox .attribute,
.classLabel .label,
.node .label code,
text.er.entityLabel tspan,
g.classGroup .classText {
  font-family: "JetBrains Mono Variable", "JetBrains Mono", monospace !important;
  font-size: 0.85em;
}

/* Generous inner padding for all node labels */
.node .label,
g.classGroup .label,
.stateGroup .label {
  padding: 12px 24px;
}

/* Consistent 2px stroke weight on ALL connector lines */
.flowchart-link,
.edge-pattern-solid,
.edge-pattern-dotted,
.messageLine0,
.messageLine1,
.relation,
.transition,
path.er.relationshipLine {
  stroke-width: 2px !important;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ============================================================
   FLOWCHART (also covers Use Case, Activity, Component, Deployment)
   ============================================================ */

/* Cluster/Subgraph — ultra-subtle "swimlane" partitioning */
.cluster rect {
  rx: 16 !important;
  ry: 16 !important;
  stroke-width: 1px !important;
  stroke-dasharray: 6 4 !important;
}
.cluster .nodeLabel,
.cluster-label .nodeLabel {
  font-weight: 500 !important;
  font-size: 0.8em !important;
  opacity: 0.55 !important;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ============================================================
   SEQUENCE DIAGRAM
   ============================================================ */

/* Actor boxes */
.actor {
  rx: 16;
  ry: 16;
}

/* Activation bars — slightly rounded */
.activation0,
.activation1,
.activation2 {
  rx: 6;
  ry: 6;
}

/* Loop/alt/opt boxes — consistent rounding */
.loopLine {
  stroke-width: 1.5px !important;
  stroke-dasharray: 4 3 !important;
}

/* ============================================================
   CLASS DIAGRAM
   ============================================================ */

/* Class header emphasis */
g.classGroup .title-text {
  font-weight: 600 !important;
  font-size: 1.1em;
}
/* Section dividers between properties/methods */
g.classGroup rect.divider {
  stroke-width: 1.5px;
}
/* Class box unified rounding */
g.classGroup rect {
  rx: 16 !important;
  ry: 16 !important;
}
/* Composition/aggregation markers */
#compositionStart, #compositionEnd,
#aggregationStart, #aggregationEnd,
#dependencyStart, #dependencyEnd {
  stroke-width: 1.5px;
}

/* ============================================================
   STATE DIAGRAM (also covers Activity diagrams)
   ============================================================ */

.stateGroup rect {
  rx: 16;
  ry: 16;
}
/* State label text */
.stateGroup text {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-weight: 600;
}
/* Start/end circles */
.start-state,
.end-state-outer,
.end-state-inner {
  stroke-width: 2px;
}
/* Transition arrows */
.transition {
  stroke-width: 2px !important;
}
/* Composite state containers (nested states) */
.composit {
  rx: 16;
  ry: 16;
}

/* ============================================================
   ER DIAGRAM (Entity-Relationship)
   ============================================================ */

/* Entity boxes */
.entityBox {
  rx: 16;
  ry: 16;
  stroke-width: 1.5px;
}
/* Entity name labels */
text.er.entityLabel {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-weight: 600;
  font-size: 1.1em;
}
/* Attribute text — monospace */
.er.attributeBoxEven,
.er.attributeBoxOdd {
  rx: 0;
}
/* Relationship lines */
path.er.relationshipLine {
  stroke-width: 2px !important;
}
/* Relationship labels */
.er.relationshipLabel {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-size: 0.85em;
  opacity: 0.7;
}

/* ============================================================
   NOTES — all diagram types
   ============================================================ */

.note {
  rx: 12;
  ry: 12;
}

/* ============================================================
   GANTT (bonus)
   ============================================================ */
.section0, .section1, .section2, .section3 {
  rx: 6;
  ry: 6;
}
`;

/** Light mode CSS — subtle blue-tinted elevation */
export function getLightThemeCSS(): string {
  return `${sharedThemeCSS}

/* === Light Mode Shadows — unified across all diagram types === */

/* Flowchart/Use Case/Activity/Component/Deployment nodes */
.node rect,
.node circle,
.node polygon,
.node ellipse,
.node .label-container {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.10))
          drop-shadow(0 3px 10px rgba(0, 82, 204, 0.05));
}

/* Sequence actors */
.actor {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.10))
          drop-shadow(0 3px 10px rgba(0, 82, 204, 0.05));
}

/* Class diagram boxes */
g.classGroup rect {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.10))
          drop-shadow(0 3px 10px rgba(0, 82, 204, 0.05));
}

/* State diagram boxes */
.stateGroup rect {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.10))
          drop-shadow(0 3px 10px rgba(0, 82, 204, 0.05));
}

/* ER diagram entities */
.entityBox {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.10))
          drop-shadow(0 3px 10px rgba(0, 82, 204, 0.05));
}

/* Cluster — nearly invisible background */
.cluster rect {
  fill-opacity: 0.04 !important;
  filter: none !important;
}

/* Notes */
.note {
  filter: drop-shadow(0 1px 3px rgba(0, 82, 204, 0.06));
}
`;
}

/** Dark mode CSS — deeper shadows with navy tint */
export function getDarkThemeCSS(): string {
  return `${sharedThemeCSS}

/* === Dark Mode Shadows — unified across all diagram types === */

/* Flowchart/Use Case/Activity/Component/Deployment nodes */
.node rect,
.node circle,
.node polygon,
.node ellipse,
.node .label-container {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.18))
          drop-shadow(0 5px 12px rgba(10, 25, 47, 0.35));
}

/* Sequence actors */
.actor {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.18))
          drop-shadow(0 5px 12px rgba(10, 25, 47, 0.35));
}

/* Class diagram boxes */
g.classGroup rect {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.18))
          drop-shadow(0 5px 12px rgba(10, 25, 47, 0.35));
}

/* State diagram boxes */
.stateGroup rect {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.18))
          drop-shadow(0 5px 12px rgba(10, 25, 47, 0.35));
}

/* ER diagram entities */
.entityBox {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.18))
          drop-shadow(0 5px 12px rgba(10, 25, 47, 0.35));
}

/* Cluster — ultra-subtle swimlane in dark mode */
.cluster rect {
  fill-opacity: 0.05 !important;
  filter: none !important;
}

/* Notes */
.note {
  filter: drop-shadow(0 1px 4px rgba(59, 130, 246, 0.10));
}

/* Brighter edge labels in dark mode for readability */
.edgeLabel,
.messageText,
.er.relationshipLabel {
  opacity: 0.8;
}
`;
}
