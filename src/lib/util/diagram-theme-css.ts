/**
 * CSS strings injected into mermaid SVGs via themeCSS config.
 * Controls styling that themeVariables cannot: border-radius, shadows,
 * typography hierarchy, stroke widths, and visual refinements.
 */

/** Shared CSS rules applied in both light and dark modes */
const sharedThemeCSS = `
/* Squircle nodes — 12px border-radius on all node shapes */
.node rect,
.node .label-container,
.node polygon {
  rx: 12;
  ry: 12;
}

/* Typography hierarchy — titles vs edge labels */
.nodeLabel {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-weight: 600;
  font-size: 1.1em;
}
.edgeLabel {
  font-family: "Inter Variable", system-ui, sans-serif !important;
  font-size: 0.9em;
  opacity: 0.75;
}

/* Technical/monospace text for ER attributes, class members */
.entityBox .attribute,
.classLabel .label,
.node .label code,
text.er.entityLabel tspan {
  font-family: "JetBrains Mono Variable", "JetBrains Mono", monospace !important;
  font-size: 0.85em;
}

/* Arrow stroke — consistent 2px weight */
.flowchart-link,
.edge-pattern-solid,
.edge-pattern-dotted,
.messageLine0,
.messageLine1 {
  stroke-width: 2px !important;
}

/* Sequence diagram — rounded activation bars */
.activation0,
.activation1,
.activation2 {
  rx: 6;
  ry: 6;
}

/* Class diagram — card-style header emphasis */
g.classGroup .title-text {
  font-weight: 600 !important;
  font-size: 1.1em;
}
g.classGroup rect.divider {
  stroke-width: 1.5px;
}

/* ER diagram — cleaner entity boxes */
.entityBox {
  rx: 8;
  ry: 8;
}

/* Cluster/subgraph styling */
.cluster rect {
  rx: 12 !important;
  ry: 12 !important;
}

/* Note boxes — rounded corners */
.note {
  rx: 8;
  ry: 8;
}

/* Gantt — bar styling */
.section0, .section1, .section2, .section3 {
  rx: 4;
  ry: 4;
}

/* State diagram — rounded states */
.stateGroup rect {
  rx: 12;
  ry: 12;
}
`;

/** Light mode CSS — lighter shadows with blue tint */
export function getLightThemeCSS(): string {
  return `${sharedThemeCSS}
/* Light mode shadows — subtle blue-tinted elevation */
.node rect,
.node circle,
.node polygon,
.node .label-container {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.12))
          drop-shadow(0 4px 12px rgba(0, 82, 204, 0.06));
}

/* Cluster shadow */
.cluster rect {
  filter: drop-shadow(0 2px 8px rgba(0, 82, 204, 0.08));
}

/* Actor boxes in sequence diagrams */
.actor {
  filter: drop-shadow(0 1px 3px rgba(0, 82, 204, 0.10));
}

/* Entity boxes in ER diagrams */
.entityBox {
  filter: drop-shadow(0 1px 3px rgba(0, 82, 204, 0.10));
}
`;
}

/** Dark mode CSS — deeper shadows with navy tint */
export function getDarkThemeCSS(): string {
  return `${sharedThemeCSS}
/* Dark mode shadows — deeper blue-navy elevation */
.node rect,
.node circle,
.node polygon,
.node .label-container {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.20))
          drop-shadow(0 6px 15px rgba(10, 25, 47, 0.40));
}

/* Cluster shadow */
.cluster rect {
  filter: drop-shadow(0 2px 10px rgba(10, 25, 47, 0.50));
}

/* Actor boxes in sequence diagrams */
.actor {
  filter: drop-shadow(0 1px 4px rgba(59, 130, 246, 0.15));
}

/* Entity boxes in ER diagrams */
.entityBox {
  filter: drop-shadow(0 1px 4px rgba(59, 130, 246, 0.15));
}

/* Brighter edge labels in dark mode for readability */
.edgeLabel {
  opacity: 0.85;
}
`;
}
