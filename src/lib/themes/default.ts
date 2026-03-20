/**
 * Default diagram theme — light + dark variants.
 * Merged from default-light.ts and default-dark.ts.
 */

import { sharedDiagramCSS } from './shared-diagram-css';
import type { DiagramTheme } from './types';

const lightDiagramCSS = `${sharedDiagramCSS}

/* === Light Mode Shadows === */
.node rect, .node circle, .node polygon, .node ellipse, .node .label-container {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.10))
          drop-shadow(0 3px 10px rgba(0, 82, 204, 0.05));
}
.actor {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.10))
          drop-shadow(0 3px 10px rgba(0, 82, 204, 0.05));
}
g.classGroup rect {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.10))
          drop-shadow(0 3px 10px rgba(0, 82, 204, 0.05));
}
.stateGroup rect {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.10))
          drop-shadow(0 3px 10px rgba(0, 82, 204, 0.05));
}
.entityBox {
  filter: drop-shadow(0 1px 2px rgba(0, 82, 204, 0.10))
          drop-shadow(0 3px 10px rgba(0, 82, 204, 0.05));
}
.cluster rect {
  fill-opacity: 0.04 !important;
  filter: none !important;
}
.note {
  filter: drop-shadow(0 1px 3px rgba(0, 82, 204, 0.06));
}
`;

const darkDiagramCSS = `${sharedDiagramCSS}

/* === Dark Mode Shadows === */
.node rect, .node circle, .node polygon, .node ellipse, .node .label-container {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.18))
          drop-shadow(0 5px 12px rgba(10, 25, 47, 0.35));
}
.actor {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.18))
          drop-shadow(0 5px 12px rgba(10, 25, 47, 0.35));
}
g.classGroup rect {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.18))
          drop-shadow(0 5px 12px rgba(10, 25, 47, 0.35));
}
.stateGroup rect {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.18))
          drop-shadow(0 5px 12px rgba(10, 25, 47, 0.35));
}
.entityBox {
  filter: drop-shadow(0 1px 3px rgba(59, 130, 246, 0.18))
          drop-shadow(0 5px 12px rgba(10, 25, 47, 0.35));
}
.cluster rect {
  fill-opacity: 0.05 !important;
  filter: none !important;
}
.note {
  filter: drop-shadow(0 1px 4px rgba(59, 130, 246, 0.10));
}
`;

export const defaultTheme: DiagramTheme = {
  id: 'default',
  name: 'Default',
  light: {
    cssVariables: {
      '--accent': 'hsl(173 58% 39%)',
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--background': 'hsl(220 14% 98%)',
      '--border': 'hsl(220 13% 91%)',
      '--border-dark': 'hsl(220 13% 83%)',
      '--canvas-border': 'hsl(220 13% 88%)',
      '--card': 'hsl(0 0% 100%)',
      '--card-foreground': 'hsl(222.2 84% 4.9%)',
      '--destructive': 'hsl(0 72.22% 50.59%)',
      '--destructive-foreground': 'hsl(210 40% 98%)',
      '--foreground': 'hsl(0 0% 10%)',
      '--glass-bg': 'hsl(0 0% 100% / 0.7)',
      '--glass-border': 'hsl(220 13% 88%)',
      '--info': 'hsl(173 58% 39%)',
      '--input': 'hsl(220 13% 91%)',
      '--muted': 'hsl(220 14% 95%)',
      '--muted-foreground': 'hsl(220 9% 46%)',
      '--popover': 'hsl(0 0% 100%)',
      '--popover-foreground': 'hsl(222.2 84% 4.9%)',
      '--primary': 'hsl(217 91% 44%)',
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--primary-light': 'hsl(217 91% 55%)',
      '--radius': '0.75rem',
      '--ring': 'hsl(222.2 84% 4.9%)',
      '--secondary': 'hsl(210 40% 96.1%)',
      '--secondary-foreground': 'hsl(222.2 47.4% 11.2%)',
      '--shadow-color': 'hsl(220 13% 70% / 0.15)',
      '--success': 'hsl(134 61% 41%)'
    },
    diagramCSS: lightDiagramCSS,
    diagramVariables: {
      activationBkgColor: '#DBEAFE',
      activationBorderColor: '#1D4ED8',
      actorBkg: '#DBEAFE',
      actorBorder: '#1D4ED8',
      actorTextColor: '#0F172A',
      attributeBackgroundColorEven: '#EFF6FF',
      attributeBackgroundColorOdd: '#FFFFFF',
      clusterBkg: '#EFF6FF',
      clusterBorder: '#93C5FD',
      crit0: '#DC2626',
      done0: '#16A34A',
      edgeLabelBackground: 'transparent',
      fontFamily: '"Inter Variable", system-ui, sans-serif',
      fontSize: '14px',
      git0: '#1D4ED8',
      git1: '#0E7490',
      git2: '#15803D',
      git3: '#B45309',
      git4: '#DC2626',
      git5: '#7C3AED',
      git6: '#C2410C',
      git7: '#0891B2',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#DBEAFE',
      labelBoxBorderColor: '#0E7490',
      labelColor: '#0F172A',
      labelTextColor: '#0F172A',
      lineColor: '#1D4ED8',
      loopTextColor: '#0F172A',
      mainBkg: '#DBEAFE',
      nodeBorder: '#1D4ED8',
      noteBkgColor: '#FEF3C7',
      noteBorderColor: '#B45309',
      noteTextColor: '#0F172A',
      pie1: '#1D4ED8',
      pie2: '#0E7490',
      pie3: '#15803D',
      pie4: '#B45309',
      pie5: '#DC2626',
      pie6: '#7C3AED',
      pie7: '#C2410C',
      primaryBorderColor: '#1D4ED8',
      primaryColor: '#DBEAFE',
      primaryTextColor: '#0F172A',
      secondaryBorderColor: '#0E7490',
      secondaryColor: '#E0F2FE',
      secondaryTextColor: '#0F172A',
      sequenceNumberColor: '#FFFFFF',
      signalColor: '#1D4ED8',
      signalTextColor: '#0F172A',
      tertiaryBorderColor: '#15803D',
      tertiaryColor: '#DCFCE7',
      tertiaryTextColor: '#0F172A',
      titleColor: '#1D4ED8'
    },
    svgPostProcess: { gradientStart: '#0052CC', gradientEnd: '#00B4DB' }
  },
  dark: {
    cssVariables: {
      '--accent': 'hsl(187 72% 48%)',
      '--accent-foreground': 'hsl(214 80% 8%)',
      '--background': 'hsl(214 80% 8%)',
      '--border': 'rgba(255, 255, 255, 0.08)',
      '--border-dark': 'rgba(255, 255, 255, 0.14)',
      '--canvas-border': 'rgba(255, 255, 255, 0.06)',
      '--card': 'hsl(214 60% 12%)',
      '--card-foreground': 'hsl(213 20% 88%)',
      '--destructive': 'hsl(0 62.8% 30.6%)',
      '--destructive-foreground': 'hsl(210 40% 98%)',
      '--foreground': 'hsl(213 20% 88%)',
      '--glass-bg': 'rgba(255, 255, 255, 0.04)',
      '--glass-border': 'rgba(255, 255, 255, 0.08)',
      '--gradient-end': 'hsl(214 65% 12%)',
      '--gradient-start': 'hsl(214 80% 8%)',
      '--input': 'hsl(214 55% 16%)',
      '--muted': 'hsl(214 55% 14%)',
      '--muted-foreground': 'hsl(213 15% 60%)',
      '--popover': 'hsl(214 60% 12%)',
      '--popover-foreground': 'hsl(213 20% 88%)',
      '--primary': 'hsl(217 91% 50%)',
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--ring': 'hsl(217 91% 60%)',
      '--secondary': 'hsl(214 55% 16%)',
      '--secondary-foreground': 'hsl(213 20% 88%)',
      '--shadow-color': 'hsl(214 80% 3% / 0.6)'
    },
    diagramCSS: darkDiagramCSS,
    diagramVariables: {
      activationBkgColor: '#1E3A5F',
      activationBorderColor: '#60A5FA',
      actorBkg: '#0F2B52',
      actorBorder: '#60A5FA',
      actorTextColor: '#F1F5F9',
      attributeBackgroundColorEven: '#0D1F3C',
      attributeBackgroundColorOdd: '#0B1628',
      clusterBkg: '#0D1F3C',
      clusterBorder: '#3B82F6',
      crit0: '#EF4444',
      done0: '#22C55E',
      edgeLabelBackground: 'transparent',
      fontFamily: '"Inter Variable", system-ui, sans-serif',
      fontSize: '14px',
      git0: '#60A5FA',
      git1: '#22D3EE',
      git2: '#4ADE80',
      git3: '#FBBF24',
      git4: '#F87171',
      git5: '#C084FC',
      git6: '#FB923C',
      git7: '#2DD4BF',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#0F2B52',
      labelBoxBorderColor: '#22D3EE',
      labelColor: '#F1F5F9',
      labelTextColor: '#F1F5F9',
      lineColor: '#60A5FA',
      loopTextColor: '#F1F5F9',
      mainBkg: '#0F2B52',
      nodeBorder: '#60A5FA',
      noteBkgColor: '#2A2000',
      noteBorderColor: '#FBBF24',
      noteTextColor: '#F1F5F9',
      pie1: '#60A5FA',
      pie2: '#22D3EE',
      pie3: '#4ADE80',
      pie4: '#FBBF24',
      pie5: '#F87171',
      pie6: '#C084FC',
      pie7: '#FB923C',
      primaryBorderColor: '#60A5FA',
      primaryColor: '#0F2B52',
      primaryTextColor: '#F1F5F9',
      secondaryBorderColor: '#22D3EE',
      secondaryColor: '#0D3354',
      secondaryTextColor: '#F1F5F9',
      sequenceNumberColor: '#FFFFFF',
      signalColor: '#60A5FA',
      signalTextColor: '#F1F5F9',
      tertiaryBorderColor: '#4ADE80',
      tertiaryColor: '#0D3A2A',
      tertiaryTextColor: '#F1F5F9',
      titleColor: '#93C5FD'
    },
    svgPostProcess: { gradientStart: '#3B82F6', gradientEnd: '#60A5FA' }
  }
};
