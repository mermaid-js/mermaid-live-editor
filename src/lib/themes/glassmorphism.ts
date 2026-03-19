/**
 * Glassmorphism theme — translucent panels, frosted glass, soft gradients.
 * Light variant: lavender/purple tints on white, lighter shadows.
 * Dark variant: original deep purple glassmorphism.
 */

import { sharedDiagramCSS } from './shared-diagram-css';
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
.edgeLabel, .messageText, .er.relationshipLabel {
  opacity: 0.75;
}
`;

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
      activationBorderColor: '#8B5CF6',
      actorBkg: '#E0D4FC',
      actorBorder: '#8B5CF6',
      actorTextColor: '#1E1145',
      attributeBackgroundColorEven: '#F5F0FF',
      attributeBackgroundColorOdd: '#FFFFFF',
      clusterBkg: '#F3EEFF',
      clusterBorder: '#C4B5FD',
      crit0: '#FF4D4D',
      done0: '#34D399',
      edgeLabelBackground: '#FFFFFF',
      fontFamily: '"Inter Variable", system-ui, sans-serif',
      fontSize: '14px',
      git0: '#8B5CF6',
      git1: '#EC4899',
      git2: '#34D399',
      git3: '#F59E0B',
      git4: '#FF6B6B',
      git5: '#06B6D4',
      git6: '#FF9671',
      git7: '#A78BFA',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#EDE9FE',
      labelBoxBorderColor: '#EC4899',
      labelColor: '#1E1145',
      labelTextColor: '#1E1145',
      lineColor: '#8B5CF6',
      loopTextColor: '#1E1145',
      mainBkg: '#E0D4FC',
      nodeBorder: '#8B5CF6',
      noteBkgColor: '#FFF8E1',
      noteBorderColor: '#F59E0B',
      noteTextColor: '#1E1145',
      pie1: '#8B5CF6',
      pie2: '#EC4899',
      pie3: '#34D399',
      pie4: '#F59E0B',
      pie5: '#FF6B6B',
      pie6: '#06B6D4',
      pie7: '#FF9671',
      primaryBorderColor: '#8B5CF6',
      primaryColor: '#E0D4FC',
      primaryTextColor: '#1E1145',
      secondaryBorderColor: '#EC4899',
      secondaryColor: '#F3EEFF',
      secondaryTextColor: '#1E1145',
      sequenceNumberColor: '#FFFFFF',
      signalColor: '#8B5CF6',
      signalTextColor: '#1E1145',
      tertiaryBorderColor: '#34D399',
      tertiaryColor: '#F0FFF4',
      tertiaryTextColor: '#1E1145',
      titleColor: '#7C3AED'
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
      activationBorderColor: '#8B5CF6',
      actorBkg: '#1E1145',
      actorBorder: '#8B5CF6',
      actorTextColor: '#E0D8F0',
      attributeBackgroundColorEven: '#1A0F40',
      attributeBackgroundColorOdd: '#150C35',
      clusterBkg: '#1A0F40',
      clusterBorder: '#2D1B69',
      crit0: '#FF4D4D',
      done0: '#34D399',
      edgeLabelBackground: '#150C35',
      fontFamily: '"Inter Variable", system-ui, sans-serif',
      fontSize: '14px',
      git0: '#8B5CF6',
      git1: '#EC4899',
      git2: '#34D399',
      git3: '#F59E0B',
      git4: '#FF6B6B',
      git5: '#06B6D4',
      git6: '#FF9671',
      git7: '#A78BFA',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#2D1B69',
      labelBoxBorderColor: '#EC4899',
      labelColor: '#E0D8F0',
      labelTextColor: '#E0D8F0',
      lineColor: '#8B5CF6',
      loopTextColor: '#E0D8F0',
      mainBkg: '#1E1145',
      nodeBorder: '#8B5CF6',
      noteBkgColor: '#2A1F00',
      noteBorderColor: '#F59E0B',
      noteTextColor: '#E0D8F0',
      pie1: '#8B5CF6',
      pie2: '#EC4899',
      pie3: '#34D399',
      pie4: '#F59E0B',
      pie5: '#FF6B6B',
      pie6: '#06B6D4',
      pie7: '#FF9671',
      primaryBorderColor: '#8B5CF6',
      primaryColor: '#1E1145',
      primaryTextColor: '#E0D8F0',
      secondaryBorderColor: '#EC4899',
      secondaryColor: '#2D1B69',
      secondaryTextColor: '#E0D8F0',
      sequenceNumberColor: '#FFFFFF',
      signalColor: '#8B5CF6',
      signalTextColor: '#E0D8F0',
      tertiaryBorderColor: '#34D399',
      tertiaryColor: '#0D3A2A',
      tertiaryTextColor: '#E0D8F0',
      titleColor: '#A78BFA'
    },
    svgPostProcess: { gradientStart: '#8B5CF6', gradientEnd: '#EC4899' }
  }
};
