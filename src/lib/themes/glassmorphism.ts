/**
 * Glassmorphism theme — translucent panels, frosted glass, soft gradients.
 * Light variant: lavender/purple tints on white, lighter shadows.
 * Dark variant: original deep purple glassmorphism.
 */

import { darkModeDiagramFixCSS, sharedDiagramCSS } from './shared-diagram-css';
import type { DiagramTheme } from './types';

const glassLightDiagramCSS = `${sharedDiagramCSS}

/* === Glassmorphism Light — soft purple glow === */
.node rect, .node circle, .node polygon, .node ellipse, .node .label-container {
  filter: drop-shadow(0 1px 4px rgba(139, 92, 246, 0.12))
          drop-shadow(0 3px 12px rgba(139, 92, 246, 0.06));
}
.actor {
  filter: drop-shadow(0 1px 4px rgba(139, 92, 246, 0.12))
          drop-shadow(0 3px 12px rgba(139, 92, 246, 0.06));
}
g.classGroup rect {
  filter: drop-shadow(0 1px 4px rgba(139, 92, 246, 0.12))
          drop-shadow(0 3px 12px rgba(139, 92, 246, 0.06));
}
.stateGroup rect {
  filter: drop-shadow(0 1px 4px rgba(139, 92, 246, 0.12))
          drop-shadow(0 3px 12px rgba(139, 92, 246, 0.06));
}
.entityBox {
  filter: drop-shadow(0 1px 4px rgba(139, 92, 246, 0.12))
          drop-shadow(0 3px 12px rgba(139, 92, 246, 0.06));
}
.cluster rect {
  fill-opacity: 0.05 !important;
  filter: none !important;
}
.note {
  filter: drop-shadow(0 1px 4px rgba(139, 92, 246, 0.08));
}
`;

const glassDarkDiagramCSS = `${sharedDiagramCSS}

/* === Glassmorphism Dark — frosted glow === */
.node rect, .node circle, .node polygon, .node ellipse, .node .label-container {
  filter: drop-shadow(0 2px 8px rgba(139, 92, 246, 0.15))
          drop-shadow(0 4px 16px rgba(139, 92, 246, 0.08));
}
.actor {
  filter: drop-shadow(0 2px 8px rgba(139, 92, 246, 0.15))
          drop-shadow(0 4px 16px rgba(139, 92, 246, 0.08));
}
g.classGroup rect {
  filter: drop-shadow(0 2px 8px rgba(139, 92, 246, 0.15))
          drop-shadow(0 4px 16px rgba(139, 92, 246, 0.08));
}
.stateGroup rect {
  filter: drop-shadow(0 2px 8px rgba(139, 92, 246, 0.15))
          drop-shadow(0 4px 16px rgba(139, 92, 246, 0.08));
}
.entityBox {
  filter: drop-shadow(0 2px 8px rgba(139, 92, 246, 0.15))
          drop-shadow(0 4px 16px rgba(139, 92, 246, 0.08));
}
.cluster rect {
  fill-opacity: 0.06 !important;
  filter: none !important;
}
.note {
  filter: drop-shadow(0 1px 6px rgba(139, 92, 246, 0.10));
}
${darkModeDiagramFixCSS({
  bgColor: '#150C35',
  textColor: '#F5F3FF',
  borderColor: '#2D1B69',
  mutedColor: '#3B2580'
})}`;

export const glassmorphismTheme: DiagramTheme = {
  id: 'glassmorphism',
  name: 'Glassmorphism',
  light: {
    cssVariables: {
      '--accent': 'hsl(320 65% 55%)',
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--background': 'hsl(260 20% 97%)',
      '--border': 'hsl(260 20% 88%)',
      '--border-dark': 'hsl(260 20% 80%)',
      '--canvas-border': 'hsl(260 20% 85%)',
      '--card': 'hsl(0 0% 100% / 0.75)',
      '--card-foreground': 'hsl(260 30% 15%)',
      '--destructive': 'hsl(0 72% 51%)',
      '--destructive-foreground': 'hsl(0 0% 100%)',
      '--foreground': 'hsl(260 30% 15%)',
      '--glass-bg': 'hsl(0 0% 100% / 0.65)',
      '--glass-border': 'hsl(260 20% 85%)',
      '--info': 'hsl(260 80% 60%)',
      '--input': 'hsl(260 20% 90%)',
      '--muted': 'hsl(260 20% 94%)',
      '--muted-foreground': 'hsl(260 10% 45%)',
      '--popover': 'hsl(0 0% 100% / 0.9)',
      '--popover-foreground': 'hsl(260 30% 15%)',
      '--primary': 'hsl(260 80% 58%)',
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--primary-light': 'hsl(260 80% 68%)',
      '--radius': '1rem',
      '--ring': 'hsl(260 80% 58%)',
      '--secondary': 'hsl(260 25% 93%)',
      '--secondary-foreground': 'hsl(260 30% 20%)',
      '--shadow-color': 'hsl(260 30% 70% / 0.12)',
      '--success': 'hsl(160 60% 42%)'
    },
    diagramCSS: glassLightDiagramCSS,
    diagramVariables: {
      activationBkgColor: '#EDE9FE',
      activationBorderColor: '#7C3AED',
      actorBkg: '#DDD6FE',
      actorBorder: '#7C3AED',
      actorTextColor: '#1E1B4B',
      attributeBackgroundColorEven: '#F5F3FF',
      attributeBackgroundColorOdd: '#FFFFFF',
      cScale0: '#DDD6FE',
      cScale1: '#FCE7F3',
      cScale2: '#DCFCE7',
      cScale3: '#FEF3C7',
      cScale4: '#FEE2E2',
      cScale5: '#E0E7FF',
      cScale6: '#FFEDD5',
      cScale7: '#CFFAFE',
      cScaleLabel0: '#3B0764',
      cScaleLabel1: '#831843',
      cScaleLabel2: '#14532D',
      cScaleLabel3: '#78350F',
      cScaleLabel4: '#7F1D1D',
      cScaleLabel5: '#1E1B4B',
      cScaleLabel6: '#7C2D12',
      cScaleLabel7: '#134E4A',
      cScalePeer1: '#A78BFA',
      cScalePeer2: '#F9A8D4',
      cScalePeer3: '#86EFAC',
      cScalePeer4: '#FDE68A',
      cScalePeer5: '#FCA5A5',
      cScalePeer6: '#A5B4FC',
      cScalePeer7: '#FDBA74',
      clusterBkg: '#F5F3FF',
      clusterBorder: '#A78BFA',
      crit0: '#DC2626',
      done0: '#16A34A',
      edgeLabelBackground: 'transparent',
      fontFamily: '"Inter Variable", system-ui, sans-serif',
      fontSize: '14px',
      git0: '#7C3AED',
      git1: '#DB2777',
      git2: '#16A34A',
      git3: '#D97706',
      git4: '#DC2626',
      git5: '#0891B2',
      git6: '#C2410C',
      git7: '#6D28D9',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#EDE9FE',
      labelBoxBorderColor: '#DB2777',
      labelColor: '#1E1B4B',
      labelTextColor: '#1E1B4B',
      lineColor: '#7C3AED',
      loopTextColor: '#1E1B4B',
      mainBkg: '#DDD6FE',
      nodeBorder: '#7C3AED',
      noteBkgColor: '#FEF3C7',
      noteBorderColor: '#D97706',
      noteTextColor: '#1E1B4B',
      pie1: '#7C3AED',
      pie2: '#DB2777',
      pie3: '#16A34A',
      pie4: '#D97706',
      pie5: '#DC2626',
      pie6: '#0891B2',
      pie7: '#C2410C',
      primaryBorderColor: '#7C3AED',
      primaryColor: '#DDD6FE',
      primaryTextColor: '#1E1B4B',
      secondaryBorderColor: '#DB2777',
      secondaryColor: '#F5F3FF',
      secondaryTextColor: '#1E1B4B',
      sequenceNumberColor: '#FFFFFF',
      signalColor: '#7C3AED',
      signalTextColor: '#1E1B4B',
      tertiaryBorderColor: '#16A34A',
      tertiaryColor: '#DCFCE7',
      tertiaryTextColor: '#1E1B4B',
      titleColor: '#6D28D9'
    },
    svgPostProcess: { gradientStart: '#8B5CF6', gradientEnd: '#EC4899' }
  },
  dark: {
    cssVariables: {
      '--accent': 'hsl(320 72% 60%)',
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--background': 'hsl(260 30% 8%)',
      '--border': 'rgba(255, 255, 255, 0.10)',
      '--border-dark': 'rgba(255, 255, 255, 0.16)',
      '--canvas-border': 'rgba(255, 255, 255, 0.06)',
      '--card': 'hsl(260 25% 14% / 0.7)',
      '--card-foreground': 'hsl(260 10% 90%)',
      '--destructive': 'hsl(0 60% 45%)',
      '--destructive-foreground': 'hsl(0 0% 98%)',
      '--foreground': 'hsl(260 10% 90%)',
      '--glass-bg': 'rgba(255, 255, 255, 0.06)',
      '--glass-border': 'rgba(255, 255, 255, 0.12)',
      '--gradient-end': 'hsl(280 25% 12%)',
      '--gradient-start': 'hsl(260 30% 8%)',
      '--info': 'hsl(260 80% 65%)',
      '--input': 'hsl(260 25% 18% / 0.5)',
      '--muted': 'hsl(260 25% 15% / 0.5)',
      '--muted-foreground': 'hsl(260 10% 55%)',
      '--popover': 'hsl(260 25% 14% / 0.85)',
      '--popover-foreground': 'hsl(260 10% 90%)',
      '--primary': 'hsl(260 80% 65%)',
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--primary-light': 'hsl(260 80% 72%)',
      '--radius': '1rem',
      '--ring': 'hsl(260 80% 65%)',
      '--secondary': 'hsl(260 30% 18% / 0.6)',
      '--secondary-foreground': 'hsl(260 10% 88%)',
      '--shadow-color': 'hsl(260 50% 5% / 0.5)',
      '--success': 'hsl(160 60% 50%)'
    },
    diagramCSS: glassDarkDiagramCSS,
    diagramVariables: {
      activationBkgColor: '#2D1B69',
      activationBorderColor: '#A78BFA',
      actorBkg: '#1E1145',
      actorBorder: '#A78BFA',
      actorTextColor: '#F5F3FF',
      attributeBackgroundColorEven: '#1A0F40',
      attributeBackgroundColorOdd: '#150C35',
      cScale0: '#2D1B69',
      cScale1: '#4A1942',
      cScale2: '#0D3A2A',
      cScale3: '#3D2800',
      cScale4: '#4A1515',
      cScale5: '#1E1B4B',
      cScale6: '#451A03',
      cScale7: '#134E4A',
      cScaleLabel0: '#DDD6FE',
      cScaleLabel1: '#F9A8D4',
      cScaleLabel2: '#BBF7D0',
      cScaleLabel3: '#FDE68A',
      cScaleLabel4: '#FECACA',
      cScaleLabel5: '#C7D2FE',
      cScaleLabel6: '#FED7AA',
      cScaleLabel7: '#99F6E4',
      cScalePeer1: '#7C3AED',
      cScalePeer2: '#DB2777',
      cScalePeer3: '#16A34A',
      cScalePeer4: '#D97706',
      cScalePeer5: '#DC2626',
      cScalePeer6: '#6366F1',
      cScalePeer7: '#EA580C',
      clusterBkg: '#1A0F40',
      clusterBorder: '#7C3AED',
      crit0: '#EF4444',
      done0: '#22C55E',
      edgeLabelBackground: 'transparent',
      fontFamily: '"Inter Variable", system-ui, sans-serif',
      fontSize: '14px',
      git0: '#A78BFA',
      git1: '#F472B6',
      git2: '#4ADE80',
      git3: '#FBBF24',
      git4: '#F87171',
      git5: '#22D3EE',
      git6: '#FB923C',
      git7: '#C4B5FD',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#2D1B69',
      labelBoxBorderColor: '#F472B6',
      labelColor: '#F5F3FF',
      labelTextColor: '#F5F3FF',
      lineColor: '#A78BFA',
      loopTextColor: '#F5F3FF',
      mainBkg: '#1E1145',
      nodeBorder: '#A78BFA',
      noteBkgColor: '#2A1F00',
      noteBorderColor: '#FBBF24',
      noteTextColor: '#F5F3FF',
      pie1: '#A78BFA',
      pie2: '#F472B6',
      pie3: '#4ADE80',
      pie4: '#FBBF24',
      pie5: '#F87171',
      pie6: '#22D3EE',
      pie7: '#FB923C',
      primaryBorderColor: '#A78BFA',
      primaryColor: '#1E1145',
      primaryTextColor: '#F5F3FF',
      secondaryBorderColor: '#F472B6',
      secondaryColor: '#2D1B69',
      secondaryTextColor: '#F5F3FF',
      sequenceNumberColor: '#FFFFFF',
      signalColor: '#A78BFA',
      signalTextColor: '#F5F3FF',
      tertiaryBorderColor: '#4ADE80',
      tertiaryColor: '#0D3A2A',
      tertiaryTextColor: '#F5F3FF',
      titleColor: '#C4B5FD'
    },
    layoutConfig: {
      packet: {
        blockFillColor: '#1E1145',
        blockStrokeColor: '#A78BFA',
        endByteColor: '#A1A1AA',
        labelColor: '#F5F3FF',
        startByteColor: '#A1A1AA',
        titleColor: '#C4B5FD'
      },
      radar: {
        axisColor: '#A78BFA',
        graticuleColor: 'rgba(167,139,250,0.25)'
      },
      xyChart: {
        backgroundColor: '#150C35',
        titleColor: '#C4B5FD',
        xAxis: {
          labelColor: '#A1A1AA',
          titleColor: '#DDD6FE',
          tickColor: '#2D1B69',
          axisLineColor: '#2D1B69'
        },
        yAxis: {
          labelColor: '#A1A1AA',
          titleColor: '#DDD6FE',
          tickColor: '#2D1B69',
          axisLineColor: '#2D1B69'
        }
      }
    },
    svgPostProcess: { gradientStart: '#8B5CF6', gradientEnd: '#EC4899' }
  }
};
