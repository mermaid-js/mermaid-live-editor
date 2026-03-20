/**
 * Blueprint theme — technical drawing aesthetic.
 * Dark: deep navy canvas, cyan/slate palette, JetBrains Mono.
 * Light: technical drawing on light paper, cyan accents, dark text.
 */

import { darkModeDiagramFixCSS, sharedDiagramCSS } from './shared-diagram-css';
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
${darkModeDiagramFixCSS({
  bgColor: '#0B1120',
  textColor: '#CBD5E1',
  borderColor: '#0C2D4A',
  mutedColor: '#1E293B'
})}`;

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
      activationBorderColor: '#22D3EE',
      actorBkg: '#0C1A30',
      actorBorder: '#22D3EE',
      actorTextColor: '#CBD5E1',
      attributeBackgroundColorEven: '#0F172A',
      attributeBackgroundColorOdd: '#0B1120',
      cScale0: '#0C2D4A',
      cScale1: '#0C3547',
      cScale2: '#0D2818',
      cScale3: '#2D1F00',
      cScale4: '#3B1010',
      cScale5: '#1E1145',
      cScale6: '#351A03',
      cScale7: '#0D3535',
      cScaleLabel0: '#7DD3FC',
      cScaleLabel1: '#67E8F9',
      cScaleLabel2: '#86EFAC',
      cScaleLabel3: '#FDE68A',
      cScaleLabel4: '#FCA5A5',
      cScaleLabel5: '#C4B5FD',
      cScaleLabel6: '#FDBA74',
      cScaleLabel7: '#5EEAD4',
      cScalePeer1: '#0891B2',
      cScalePeer2: '#0EA5E9',
      cScalePeer3: '#22C55E',
      cScalePeer4: '#F59E0B',
      cScalePeer5: '#EF4444',
      cScalePeer6: '#8B5CF6',
      cScalePeer7: '#14B8A6',
      clusterBkg: '#0C1A30',
      clusterBorder: '#0891B2',
      crit0: '#EF4444',
      done0: '#22C55E',
      edgeLabelBackground: 'transparent',
      fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace',
      fontSize: '13px',
      git0: '#22D3EE',
      git1: '#38BDF8',
      git2: '#4ADE80',
      git3: '#FBBF24',
      git4: '#F87171',
      git5: '#C084FC',
      git6: '#F472B6',
      git7: '#2DD4BF',
      gitBranchLabel0: '#030712',
      gitInv0: '#030712',
      labelBoxBkgColor: '#0F172A',
      labelBoxBorderColor: '#22D3EE',
      labelColor: '#CBD5E1',
      labelTextColor: '#CBD5E1',
      lineColor: '#22D3EE',
      loopTextColor: '#CBD5E1',
      mainBkg: '#0C1A30',
      nodeBorder: '#22D3EE',
      noteBkgColor: '#0F172A',
      noteBorderColor: '#38BDF8',
      noteTextColor: '#CBD5E1',
      pie1: '#22D3EE',
      pie2: '#38BDF8',
      pie3: '#4ADE80',
      pie4: '#FBBF24',
      pie5: '#F87171',
      pie6: '#C084FC',
      pie7: '#F472B6',
      primaryBorderColor: '#22D3EE',
      primaryColor: '#0C1A30',
      primaryTextColor: '#CBD5E1',
      secondaryBorderColor: '#38BDF8',
      secondaryColor: '#0F172A',
      secondaryTextColor: '#CBD5E1',
      sequenceNumberColor: '#030712',
      signalColor: '#22D3EE',
      signalTextColor: '#CBD5E1',
      tertiaryBorderColor: '#4ADE80',
      tertiaryColor: '#0D2818',
      tertiaryTextColor: '#CBD5E1',
      titleColor: '#22D3EE'
    },
    layoutConfig: {
      packet: {
        blockFillColor: '#0C1A30',
        blockStrokeColor: '#22D3EE',
        endByteColor: '#64748B',
        labelColor: '#CBD5E1',
        startByteColor: '#64748B',
        titleColor: '#22D3EE'
      },
      radar: {
        axisColor: '#22D3EE',
        graticuleColor: 'rgba(34,211,238,0.20)'
      },
      xyChart: {
        backgroundColor: '#0B1120',
        titleColor: '#22D3EE',
        xAxis: {
          labelColor: '#64748B',
          titleColor: '#7DD3FC',
          tickColor: '#1E293B',
          axisLineColor: '#1E293B'
        },
        yAxis: {
          labelColor: '#64748B',
          titleColor: '#7DD3FC',
          tickColor: '#1E293B',
          axisLineColor: '#1E293B'
        }
      }
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
      activationBkgColor: '#CFFAFE',
      activationBorderColor: '#0E7490',
      actorBkg: '#CFFAFE',
      actorBorder: '#0E7490',
      actorTextColor: '#0F172A',
      attributeBackgroundColorEven: '#ECFEFF',
      attributeBackgroundColorOdd: '#FFFFFF',
      cScale0: '#CFFAFE',
      cScale1: '#E0F2FE',
      cScale2: '#DCFCE7',
      cScale3: '#FEF3C7',
      cScale4: '#FEE2E2',
      cScale5: '#EDE9FE',
      cScale6: '#FFEDD5',
      cScale7: '#CCFBF1',
      cScaleLabel0: '#164E63',
      cScaleLabel1: '#0C4A6E',
      cScaleLabel2: '#14532D',
      cScaleLabel3: '#78350F',
      cScaleLabel4: '#7F1D1D',
      cScaleLabel5: '#3B0764',
      cScaleLabel6: '#7C2D12',
      cScaleLabel7: '#134E4A',
      cScalePeer1: '#06B6D4',
      cScalePeer2: '#0284C7',
      cScalePeer3: '#16A34A',
      cScalePeer4: '#D97706',
      cScalePeer5: '#DC2626',
      cScalePeer6: '#7C3AED',
      cScalePeer7: '#0D9488',
      clusterBkg: '#ECFEFF',
      clusterBorder: '#06B6D4',
      crit0: '#DC2626',
      done0: '#16A34A',
      edgeLabelBackground: 'transparent',
      fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace',
      fontSize: '13px',
      git0: '#0E7490',
      git1: '#0369A1',
      git2: '#15803D',
      git3: '#B45309',
      git4: '#DC2626',
      git5: '#7C3AED',
      git6: '#DB2777',
      git7: '#0891B2',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#CFFAFE',
      labelBoxBorderColor: '#0E7490',
      labelColor: '#0F172A',
      labelTextColor: '#0F172A',
      lineColor: '#0E7490',
      loopTextColor: '#0F172A',
      mainBkg: '#CFFAFE',
      nodeBorder: '#0E7490',
      noteBkgColor: '#FEF3C7',
      noteBorderColor: '#0369A1',
      noteTextColor: '#0F172A',
      pie1: '#0E7490',
      pie2: '#0369A1',
      pie3: '#15803D',
      pie4: '#B45309',
      pie5: '#DC2626',
      pie6: '#7C3AED',
      pie7: '#DB2777',
      primaryBorderColor: '#0E7490',
      primaryColor: '#CFFAFE',
      primaryTextColor: '#0F172A',
      secondaryBorderColor: '#0369A1',
      secondaryColor: '#ECFEFF',
      secondaryTextColor: '#0F172A',
      sequenceNumberColor: '#FFFFFF',
      signalColor: '#0E7490',
      signalTextColor: '#0F172A',
      tertiaryBorderColor: '#15803D',
      tertiaryColor: '#DCFCE7',
      tertiaryTextColor: '#0F172A',
      titleColor: '#0E7490'
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
