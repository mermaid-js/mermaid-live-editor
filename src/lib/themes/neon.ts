/**
 * Neon theme — Three.js bloom/glow inspired cyberpunk aesthetic.
 * Dark: deep black canvas, hot pink + electric blue neon glow, bloom shadows.
 * Light: frosted white canvas, vivid neon accents, soft pink/blue tints.
 *
 * Inspired by Three.js UnrealBloomPass, particle effects, and neon signage.
 * CSS drop-shadows simulate the bloom/glow post-processing effect.
 */

import { sharedDiagramCSS } from './shared-diagram-css';
import type { DiagramTheme } from './types';

/* Neon-specific CSS shared between light and dark variants */
const neonSharedCSS = `
/* === Neon — rounded pill shapes (20px) for futuristic feel === */
.node rect, .node .label-container, .stateGroup rect,
.entityBox, .actor, .note, g.classGroup rect {
  rx: 20;
  ry: 20;
}
.cluster rect {
  rx: 20 !important;
  ry: 20 !important;
}

/* === Connector — 2px stroke with round caps for neon tube look === */
.flowchart-link, .edge-pattern-solid, .messageLine0, .messageLine1,
.relation, .transition, path.er.relationshipLine {
  stroke-width: 2px !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}

/* === Title text — neon pink uppercase === */
.titleText, .classTitle, g.classGroup .title-text {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}
`;

const neonLightDiagramCSS = `${sharedDiagramCSS}
${neonSharedCSS}

/* === Neon Light — soft pink/blue bloom glow === */
.node rect, .node circle, .node polygon, .node ellipse, .node .label-container {
  filter: drop-shadow(0 0 6px rgba(236, 72, 153, 0.15))
          drop-shadow(0 4px 16px rgba(236, 72, 153, 0.08));
}
.actor {
  filter: drop-shadow(0 0 6px rgba(236, 72, 153, 0.15))
          drop-shadow(0 4px 16px rgba(236, 72, 153, 0.08));
}
g.classGroup rect {
  filter: drop-shadow(0 0 6px rgba(236, 72, 153, 0.15))
          drop-shadow(0 4px 16px rgba(236, 72, 153, 0.08));
}
.stateGroup rect {
  filter: drop-shadow(0 0 6px rgba(236, 72, 153, 0.15))
          drop-shadow(0 4px 16px rgba(236, 72, 153, 0.08));
}
.entityBox {
  filter: drop-shadow(0 0 6px rgba(236, 72, 153, 0.15))
          drop-shadow(0 4px 16px rgba(236, 72, 153, 0.08));
}
.cluster rect {
  fill-opacity: 0.04 !important;
  stroke: rgba(236, 72, 153, 0.20) !important;
  stroke-dasharray: 6 4 !important;
  filter: none !important;
}
.note {
  filter: drop-shadow(0 0 4px rgba(99, 102, 241, 0.12));
}

/* === Neon Light title color === */
.titleText, .classTitle, g.classGroup .title-text {
  fill: #DB2777 !important;
}
`;

const neonDarkDiagramCSS = `${sharedDiagramCSS}
${neonSharedCSS}

/* === Neon Dark — intense bloom glow (Three.js UnrealBloomPass inspired) === */
.node rect, .node circle, .node polygon, .node ellipse, .node .label-container {
  filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.40))
          drop-shadow(0 0 24px rgba(236, 72, 153, 0.15))
          drop-shadow(0 8px 32px rgba(0, 0, 0, 0.50));
}
.actor {
  filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.40))
          drop-shadow(0 0 24px rgba(236, 72, 153, 0.15))
          drop-shadow(0 8px 32px rgba(0, 0, 0, 0.50));
}
g.classGroup rect {
  filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.40))
          drop-shadow(0 0 24px rgba(236, 72, 153, 0.15))
          drop-shadow(0 8px 32px rgba(0, 0, 0, 0.50));
}
.stateGroup rect {
  filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.40))
          drop-shadow(0 0 24px rgba(236, 72, 153, 0.15))
          drop-shadow(0 8px 32px rgba(0, 0, 0, 0.50));
}
.entityBox {
  filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.40))
          drop-shadow(0 0 24px rgba(236, 72, 153, 0.15))
          drop-shadow(0 8px 32px rgba(0, 0, 0, 0.50));
}
.cluster rect {
  fill-opacity: 0.05 !important;
  stroke: rgba(236, 72, 153, 0.30) !important;
  stroke-dasharray: 6 4 !important;
  filter: none !important;
}
.note {
  filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.20))
          drop-shadow(0 4px 12px rgba(0, 0, 0, 0.30));
}

/* === Neon Dark title color — hot pink glow === */
.titleText, .classTitle, g.classGroup .title-text {
  fill: #F472B6 !important;
}
`;

export const neonTheme: DiagramTheme = {
  id: 'neon',
  name: 'Neon',
  light: {
    canvasBgClass: 'neon-light',
    cssVariables: {
      '--accent': 'hsl(330 80% 50%)',
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--background': 'hsl(280 10% 98%)',
      '--border': 'hsl(280 15% 90%)',
      '--border-dark': 'hsl(280 15% 82%)',
      '--canvas-border': 'hsl(280 15% 87%)',
      '--card': 'hsl(0 0% 100% / 0.85)',
      '--card-foreground': 'hsl(280 30% 10%)',
      '--destructive': 'hsl(0 70% 50%)',
      '--destructive-foreground': 'hsl(0 0% 100%)',
      '--foreground': 'hsl(280 30% 10%)',
      '--glass-bg': 'hsl(0 0% 100% / 0.65)',
      '--glass-border': 'hsl(280 15% 87%)',
      '--info': 'hsl(245 80% 60%)',
      '--input': 'hsl(280 15% 92%)',
      '--muted': 'hsl(280 10% 95%)',
      '--muted-foreground': 'hsl(280 10% 45%)',
      '--popover': 'hsl(0 0% 100% / 0.92)',
      '--popover-foreground': 'hsl(280 30% 10%)',
      '--primary': 'hsl(330 80% 45%)',
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--primary-light': 'hsl(330 80% 55%)',
      '--radius': '1rem',
      '--ring': 'hsl(330 80% 45%)',
      '--secondary': 'hsl(280 15% 94%)',
      '--secondary-foreground': 'hsl(280 30% 15%)',
      '--shadow-color': 'hsl(330 40% 70% / 0.12)',
      '--success': 'hsl(160 60% 42%)'
    },
    diagramCSS: neonLightDiagramCSS,
    diagramVariables: {
      activationBkgColor: '#FCE7F3',
      activationBorderColor: '#DB2777',
      actorBkg: '#FDF2F8',
      actorBorder: '#DB2777',
      actorTextColor: '#1E1030',
      attributeBackgroundColorEven: '#FDF2F8',
      attributeBackgroundColorOdd: '#FFFFFF',
      clusterBkg: '#FDF2F8',
      clusterBorder: '#F472B6',
      crit0: '#DC2626',
      done0: '#16A34A',
      edgeLabelBackground: 'transparent',
      fontFamily: '"Inter Variable", system-ui, sans-serif',
      fontSize: '14px',
      git0: '#DB2777',
      git1: '#6366F1',
      git2: '#059669',
      git3: '#D97706',
      git4: '#DC2626',
      git5: '#7C3AED',
      git6: '#0891B2',
      git7: '#EA580C',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#FCE7F3',
      labelBoxBorderColor: '#6366F1',
      labelColor: '#1E1030',
      labelTextColor: '#1E1030',
      lineColor: '#DB2777',
      loopTextColor: '#1E1030',
      mainBkg: '#FDF2F8',
      nodeBorder: '#DB2777',
      noteBkgColor: '#EEF2FF',
      noteBorderColor: '#6366F1',
      noteTextColor: '#1E1030',
      pie1: '#DB2777',
      pie2: '#6366F1',
      pie3: '#059669',
      pie4: '#D97706',
      pie5: '#DC2626',
      pie6: '#7C3AED',
      pie7: '#0891B2',
      primaryBorderColor: '#DB2777',
      primaryColor: '#FDF2F8',
      primaryTextColor: '#1E1030',
      secondaryBorderColor: '#6366F1',
      secondaryColor: '#EEF2FF',
      secondaryTextColor: '#1E1030',
      sequenceNumberColor: '#FFFFFF',
      signalColor: '#DB2777',
      signalTextColor: '#1E1030',
      tertiaryBorderColor: '#059669',
      tertiaryColor: '#ECFDF5',
      tertiaryTextColor: '#1E1030',
      titleColor: '#DB2777'
    },
    svgPostProcess: {
      gradientEnd: '#6366F1',
      gradientStart: '#EC4899',
      hollowArrowColor: '#DB2777',
      shadowInnerColor: 'rgba(236, 72, 153, 0.12)',
      shadowOuterColor: 'rgba(0, 0, 0, 0.06)'
    }
  },
  dark: {
    canvasBgClass: 'neon',
    cssVariables: {
      '--accent': 'hsl(245 80% 65%)',
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--background': 'hsl(270 30% 4%)',
      '--border': 'rgba(236, 72, 153, 0.15)',
      '--border-dark': 'rgba(236, 72, 153, 0.25)',
      '--canvas-border': 'rgba(236, 72, 153, 0.08)',
      '--card': 'rgba(20, 10, 30, 0.7)',
      '--card-foreground': 'hsl(280 10% 88%)',
      '--destructive': 'hsl(0 60% 45%)',
      '--destructive-foreground': 'hsl(0 0% 98%)',
      '--foreground': 'hsl(280 10% 88%)',
      '--glass-bg': 'rgba(20, 10, 30, 0.5)',
      '--glass-border': 'rgba(236, 72, 153, 0.12)',
      '--gradient-end': 'hsl(270 25% 8%)',
      '--gradient-start': 'hsl(270 30% 4%)',
      '--info': 'hsl(245 80% 65%)',
      '--input': 'rgba(30, 15, 45, 0.6)',
      '--muted': 'rgba(30, 15, 45, 0.5)',
      '--muted-foreground': 'hsl(280 10% 50%)',
      '--popover': 'rgba(20, 10, 30, 0.90)',
      '--popover-foreground': 'hsl(280 10% 88%)',
      '--primary': 'hsl(330 80% 60%)',
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--primary-light': 'hsl(330 80% 68%)',
      '--radius': '1rem',
      '--ring': 'hsl(330 80% 60%)',
      '--secondary': 'rgba(30, 15, 45, 0.6)',
      '--secondary-foreground': 'hsl(280 10% 85%)',
      '--shadow-color': 'hsl(270 50% 3% / 0.6)',
      '--success': 'hsl(160 60% 50%)'
    },
    diagramCSS: neonDarkDiagramCSS,
    diagramVariables: {
      activationBkgColor: '#1A0520',
      activationBorderColor: '#F472B6',
      actorBkg: '#140A1E',
      actorBorder: '#F472B6',
      actorTextColor: '#E8D5F5',
      attributeBackgroundColorEven: '#1A0520',
      attributeBackgroundColorOdd: '#120818',
      clusterBkg: '#1A0520',
      clusterBorder: '#EC4899',
      crit0: '#EF4444',
      done0: '#22C55E',
      edgeLabelBackground: 'transparent',
      fontFamily: '"Inter Variable", system-ui, sans-serif',
      fontSize: '14px',
      git0: '#F472B6',
      git1: '#818CF8',
      git2: '#34D399',
      git3: '#FBBF24',
      git4: '#F87171',
      git5: '#C084FC',
      git6: '#22D3EE',
      git7: '#FB923C',
      gitBranchLabel0: '#0A0510',
      gitInv0: '#0A0510',
      labelBoxBkgColor: '#1A0520',
      labelBoxBorderColor: '#818CF8',
      labelColor: '#E8D5F5',
      labelTextColor: '#E8D5F5',
      lineColor: '#F472B6',
      loopTextColor: '#E8D5F5',
      mainBkg: '#140A1E',
      nodeBorder: '#F472B6',
      noteBkgColor: '#1A1030',
      noteBorderColor: '#818CF8',
      noteTextColor: '#E8D5F5',
      pie1: '#F472B6',
      pie2: '#818CF8',
      pie3: '#34D399',
      pie4: '#FBBF24',
      pie5: '#F87171',
      pie6: '#C084FC',
      pie7: '#22D3EE',
      primaryBorderColor: '#F472B6',
      primaryColor: '#140A1E',
      primaryTextColor: '#E8D5F5',
      secondaryBorderColor: '#818CF8',
      secondaryColor: '#1A0520',
      secondaryTextColor: '#E8D5F5',
      sequenceNumberColor: '#0A0510',
      signalColor: '#F472B6',
      signalTextColor: '#E8D5F5',
      tertiaryBorderColor: '#34D399',
      tertiaryColor: '#0A1E15',
      tertiaryTextColor: '#E8D5F5',
      titleColor: '#F472B6'
    },
    svgPostProcess: {
      gradientEnd: '#818CF8',
      gradientStart: '#EC4899',
      hollowArrowColor: '#F472B6',
      shadowInnerColor: 'rgba(236, 72, 153, 0.30)',
      shadowOuterColor: 'rgba(0, 0, 0, 0.50)'
    }
  }
};
