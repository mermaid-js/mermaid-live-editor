/**
 * Structural diagram CSS reused by all themes.
 * Extracted from diagram-theme-css.ts sharedThemeCSS.
 */

export const sharedDiagramCSS = `
/* ============================================================
   UNIVERSAL - applies to all diagram types
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

/* Typography - primary labels (semibold, 1.1em) */
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

/* Typography - secondary/metadata labels (regular, full opacity for readability) */
.edgeLabel,
.noteText,
.messageText,
.loopText,
.labelText {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-size: 0.85em;
}

/* Edge labels — transparent background, text elevated above lines via SVG post-processor */
.edgeLabel {
  padding: 2px 6px !important;
}

/* Typography - technical/monospace text */
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

/* Cluster/Subgraph - ultra-subtle "swimlane" partitioning */
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

.actor {
  rx: 16;
  ry: 16;
}

/* Activation bars - slightly rounded */
.activation0,
.activation1,
.activation2 {
  rx: 6;
  ry: 6;
}

/* Loop/alt/opt boxes - consistent rounding */
.loopLine {
  stroke-width: 1.5px !important;
  stroke-dasharray: 4 3 !important;
}

/* ============================================================
   CLASS DIAGRAM
   ============================================================ */

g.classGroup .title-text {
  font-weight: 600 !important;
  font-size: 1.1em;
}
g.classGroup rect.divider {
  stroke-width: 1.5px;
}
g.classGroup rect {
  rx: 16 !important;
  ry: 16 !important;
}
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
.stateGroup text {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-weight: 600;
}
.start-state,
.end-state-outer,
.end-state-inner {
  stroke-width: 2px;
}
.transition {
  stroke-width: 2px !important;
}
.composit {
  rx: 16;
  ry: 16;
}

/* ============================================================
   ER DIAGRAM (Entity-Relationship)
   ============================================================ */

.entityBox {
  rx: 16;
  ry: 16;
  stroke-width: 1.5px;
}
text.er.entityLabel {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-weight: 600;
  font-size: 1.1em;
}
.er.attributeBoxEven,
.er.attributeBoxOdd {
  rx: 0;
}
path.er.relationshipLine {
  stroke-width: 2px !important;
}
.er.relationshipLabel {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-size: 0.85em;
}

/* ============================================================
   NOTES - all diagram types
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
