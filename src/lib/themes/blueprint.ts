/**
 * Blueprint theme — technical drawing aesthetic.
 * Dark: deep navy canvas, cyan/slate palette, JetBrains Mono.
 * Light: technical drawing on light paper, cyan accents, dark text.
 */

import { sharedDiagramCSS } from './shared-diagram-css';
import type { DiagramTheme } from './types';

const blueprintSharedCSS = `
/* === Blueprint — node border-radius override (12px) === */
.node rect, .node .label-container, .stateGroup rect,
.entityBox, .actor, .note, g.classGroup rect {
  rx: 12;
  ry: 12;
}
.cluster rect {
  rx: 12 !important;
  ry: 12 !important;
}

/* === JetBrains Mono for ALL text === */
.nodeLabel, g.classGroup .title-text, .stateGroup .state-title,
text.er.entityLabel, .actor-man tspan, .label text {
  font-family: "JetBrains Mono Variable", "JetBrains Mono", monospace !important;
  font-weight: 500;
}
.edgeLabel, .noteText, .messageText, .loopText, .labelText {
  font-family: "JetBrains Mono Variable", "JetBrains Mono", monospace !important;
  font-size: 0.82em;
  opacity: 0.75;
}

/* === Title text — uppercase cyan === */
.titleText, .classTitle, g.classGroup .title-text {
  fill: #00B4DB !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* === Connector — 1.5px stroke === */
.flowchart-link, .edge-pattern-solid, .messageLine0, .messageLine1,
.relation, .transition, path.er.relationshipLine {
  stroke-width: 1.5px !important;
  stroke-dasharray: none !important;
}

/* === Edge labels — subdued === */
.edgeLabel, .messageText, .er.relationshipLabel {
  opacity: 0.7;
}
`;

const blueprintLightDiagramCSS = `${sharedDiagramCSS}
${blueprintSharedCSS}

/* === Blueprint Light — subtle cyan shadow === */
.node rect, .node circle, .node polygon, .node ellipse, .node .label-container {
  filter: drop-shadow(0 1px 3px rgba(0, 180, 219, 0.10))
          drop-shadow(0 4px 12px rgba(0, 0, 0, 0.06));
}
.actor {
  filter: drop-shadow(0 1px 3px rgba(0, 180, 219, 0.10))
          drop-shadow(0 4px 12px rgba(0, 0, 0, 0.06));
}
g.classGroup rect {
  filter: drop-shadow(0 1px 3px rgba(0, 180, 219, 0.10))
          drop-shadow(0 4px 12px rgba(0, 0, 0, 0.06));
}
.stateGroup rect {
  filter: drop-shadow(0 1px 3px rgba(0, 180, 219, 0.10))
          drop-shadow(0 4px 12px rgba(0, 0, 0, 0.06));
}
.entityBox {
  filter: drop-shadow(0 1px 3px rgba(0, 180, 219, 0.10))
          drop-shadow(0 4px 12px rgba(0, 0, 0, 0.06));
}
.cluster rect {
  fill-opacity: 0.04 !important;
  stroke: rgba(0, 180, 219, 0.20) !important;
  stroke-dasharray: 6 4 !important;
  filter: none !important;
}
.note {
  filter: drop-shadow(0 1px 4px rgba(0, 180, 219, 0.08));
}
`;

const blueprintDarkDiagramCSS = `${sharedDiagramCSS}
${blueprintSharedCSS}

/* === Blueprint Dark — deep elevation with cyan underglow === */
.node rect, .node circle, .node polygon, .node ellipse, .node .label-container {
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.50))
          drop-shadow(0 4px 12px rgba(0, 180, 219, 0.15));
}
.actor {
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.50))
          drop-shadow(0 4px 12px rgba(0, 180, 219, 0.15));
}
g.classGroup rect {
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.50))
          drop-shadow(0 4px 12px rgba(0, 180, 219, 0.15));
}
.stateGroup rect {
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.50))
          drop-shadow(0 4px 12px rgba(0, 180, 219, 0.15));
}
.entityBox {
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.50))
          drop-shadow(0 4px 12px rgba(0, 180, 219, 0.15));
}
.cluster rect {
  fill-opacity: 0.04 !important;
  stroke: rgba(0, 180, 219, 0.25) !important;
  stroke-dasharray: 6 4 !important;
  filter: none !important;
}
.note {
  filter: drop-shadow(0 2px 8px rgba(0, 180, 219, 0.10));
}
`;

export const blueprintTheme: DiagramTheme = {
  dark: {
    canvasBgClass: 'blueprint',
    cssVariables: {
      '--accent': 'hsl(190 100% 43%)',
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--background': '#030712',
      '--border': 'rgba(148, 163, 184, 0.15)',
      '--border-dark': 'rgba(148, 163, 184, 0.25)',
      '--canvas-border': 'rgba(148, 163, 184, 0.08)',
      '--card': 'rgba(15, 23, 42, 0.6)',
      '--card-foreground': 'hsl(215 20% 85%)',
      '--destructive': 'hsl(0 55% 42%)',
      '--destructive-foreground': 'hsl(0 0% 98%)',
      '--foreground': '#94A3B8',
      '--glass-bg': 'rgba(15, 23, 42, 0.4)',
      '--glass-border': 'rgba(148, 163, 184, 0.12)',
      '--gradient-end': '#0F172A',
      '--gradient-start': '#030712',
      '--info': '#00B4DB',
      '--input': 'rgba(15, 23, 42, 0.6)',
      '--muted': 'rgba(15, 23, 42, 0.5)',
      '--muted-foreground': 'hsl(215 15% 50%)',
      '--popover': 'rgba(15, 23, 42, 0.85)',
      '--popover-foreground': '#94A3B8',
      '--primary': '#00B4DB',
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--primary-light': 'hsl(190 90% 55%)',
      '--radius': '0.75rem',
      '--ring': '#00B4DB',
      '--secondary': 'rgba(15, 23, 42, 0.6)',
      '--secondary-foreground': '#94A3B8',
      '--shadow-color': 'rgba(0, 0, 0, 0.5)',
      '--success': 'hsl(150 60% 50%)'
    },
    diagramCSS: blueprintDarkDiagramCSS,
    diagramVariables: {
      activationBkgColor: '#0F172A',
      activationBorderColor: '#00B4DB',
      actorBkg: 'rgba(15, 23, 42, 0.6)',
      actorBorder: 'rgba(148, 163, 184, 0.15)',
      actorTextColor: '#94A3B8',
      attributeBackgroundColorEven: '#0F172A',
      attributeBackgroundColorOdd: '#0B1120',
      clusterBkg: 'rgba(15, 23, 42, 0.3)',
      clusterBorder: 'rgba(0, 180, 219, 0.25)',
      crit0: '#FF6B6B',
      done0: '#34D399',
      edgeLabelBackground: '#0B1120',
      fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace',
      fontSize: '13px',
      git0: '#00B4DB',
      git1: '#0369A1',
      git2: '#34D399',
      git3: '#F59E0B',
      git4: '#FF6B6B',
      git5: '#A78BFA',
      git6: '#EC4899',
      git7: '#06B6D4',
      gitBranchLabel0: '#030712',
      gitInv0: '#030712',
      labelBoxBkgColor: '#0F172A',
      labelBoxBorderColor: '#00B4DB',
      labelColor: '#94A3B8',
      labelTextColor: '#94A3B8',
      lineColor: '#00B4DB',
      loopTextColor: '#94A3B8',
      mainBkg: 'rgba(15, 23, 42, 0.6)',
      nodeBorder: 'rgba(148, 163, 184, 0.15)',
      noteBkgColor: '#0F172A',
      noteBorderColor: '#0369A1',
      noteTextColor: '#94A3B8',
      pie1: '#00B4DB',
      pie2: '#0369A1',
      pie3: '#34D399',
      pie4: '#F59E0B',
      pie5: '#FF6B6B',
      pie6: '#A78BFA',
      pie7: '#EC4899',
      primaryBorderColor: 'rgba(148, 163, 184, 0.15)',
      primaryColor: 'rgba(15, 23, 42, 0.6)',
      primaryTextColor: '#94A3B8',
      secondaryBorderColor: '#0369A1',
      secondaryColor: '#0F172A',
      secondaryTextColor: '#94A3B8',
      sequenceNumberColor: '#030712',
      signalColor: '#00B4DB',
      signalTextColor: '#94A3B8',
      tertiaryBorderColor: '#34D399',
      tertiaryColor: '#0D2818',
      tertiaryTextColor: '#94A3B8',
      titleColor: '#00B4DB'
    },
    svgPostProcess: {
      gradientEnd: '#0369A1',
      gradientStart: '#00B4DB',
      hollowArrowColor: '#00B4DB',
      shadowInnerColor: 'rgba(0, 180, 219, 0.15)',
      shadowOuterColor: 'rgba(0, 0, 0, 0.50)'
    }
  },
  id: 'blueprint',
  layoutConfig: {
    flowchart: { rankSpacing: 120, nodeSpacing: 80 }
  },
  light: {
    canvasBgClass: 'blueprint-light',
    cssVariables: {
      '--accent': 'hsl(190 100% 38%)',
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--background': 'hsl(210 20% 98%)',
      '--border': 'hsl(215 20% 88%)',
      '--border-dark': 'hsl(215 20% 78%)',
      '--canvas-border': 'hsl(215 20% 85%)',
      '--card': 'hsl(0 0% 100% / 0.8)',
      '--card-foreground': 'hsl(215 25% 15%)',
      '--destructive': 'hsl(0 55% 50%)',
      '--destructive-foreground': 'hsl(0 0% 100%)',
      '--foreground': 'hsl(215 25% 20%)',
      '--glass-bg': 'hsl(0 0% 100% / 0.6)',
      '--glass-border': 'hsl(215 20% 85%)',
      '--info': '#00B4DB',
      '--input': 'hsl(215 20% 90%)',
      '--muted': 'hsl(215 20% 95%)',
      '--muted-foreground': 'hsl(215 15% 45%)',
      '--popover': 'hsl(0 0% 100% / 0.92)',
      '--popover-foreground': 'hsl(215 25% 15%)',
      '--primary': '#0891B2',
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--primary-light': '#22D3EE',
      '--radius': '0.75rem',
      '--ring': '#0891B2',
      '--secondary': 'hsl(215 25% 94%)',
      '--secondary-foreground': 'hsl(215 25% 20%)',
      '--shadow-color': 'hsl(215 20% 70% / 0.12)',
      '--success': 'hsl(150 60% 42%)'
    },
    diagramCSS: blueprintLightDiagramCSS,
    diagramVariables: {
      activationBkgColor: '#E0F7FA',
      activationBorderColor: '#00B4DB',
      actorBkg: '#E0F2FE',
      actorBorder: '#0891B2',
      actorTextColor: '#1E293B',
      attributeBackgroundColorEven: '#F0F9FF',
      attributeBackgroundColorOdd: '#FFFFFF',
      clusterBkg: '#F0F9FF',
      clusterBorder: 'rgba(0, 180, 219, 0.30)',
      crit0: '#FF6B6B',
      done0: '#34D399',
      edgeLabelBackground: '#FFFFFF',
      fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace',
      fontSize: '13px',
      git0: '#00B4DB',
      git1: '#0369A1',
      git2: '#34D399',
      git3: '#F59E0B',
      git4: '#FF6B6B',
      git5: '#A78BFA',
      git6: '#EC4899',
      git7: '#06B6D4',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#E0F7FA',
      labelBoxBorderColor: '#00B4DB',
      labelColor: '#1E293B',
      labelTextColor: '#1E293B',
      lineColor: '#0891B2',
      loopTextColor: '#1E293B',
      mainBkg: '#E0F2FE',
      nodeBorder: '#0891B2',
      noteBkgColor: '#FFF8E1',
      noteBorderColor: '#0369A1',
      noteTextColor: '#1E293B',
      pie1: '#00B4DB',
      pie2: '#0369A1',
      pie3: '#34D399',
      pie4: '#F59E0B',
      pie5: '#FF6B6B',
      pie6: '#A78BFA',
      pie7: '#EC4899',
      primaryBorderColor: '#0891B2',
      primaryColor: '#E0F2FE',
      primaryTextColor: '#1E293B',
      secondaryBorderColor: '#0369A1',
      secondaryColor: '#F0F9FF',
      secondaryTextColor: '#1E293B',
      sequenceNumberColor: '#FFFFFF',
      signalColor: '#0891B2',
      signalTextColor: '#1E293B',
      tertiaryBorderColor: '#34D399',
      tertiaryColor: '#F0FFF4',
      tertiaryTextColor: '#1E293B',
      titleColor: '#0891B2'
    },
    svgPostProcess: {
      gradientEnd: '#0369A1',
      gradientStart: '#00B4DB',
      hollowArrowColor: '#0891B2',
      shadowInnerColor: 'rgba(0, 180, 219, 0.10)',
      shadowOuterColor: 'rgba(0, 0, 0, 0.08)'
    }
  },
  name: 'Blueprint'
};
