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
.edgeLabel, .messageText, .er.relationshipLabel {
  opacity: 0.8;
}
`;

const SOTATEK_BLUE = '#0052CC';
const SOTATEK_CYAN = '#00B4DB';
const SOTATEK_SUCCESS = '#00FF88';
const SOTATEK_ERROR = '#FF4D4D';
const SOTATEK_WARNING = '#FFB300';
const SOTATEK_BLUE_BRIGHT = '#3B82F6';
const DARK_NAVY = '#0A192F';

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
      activationBkgColor: '#E6F0FF',
      activationBorderColor: SOTATEK_BLUE,
      actorBkg: '#D6E4FF',
      actorBorder: SOTATEK_BLUE,
      actorTextColor: '#1A1A1A',
      attributeBackgroundColorEven: '#F5F8FF',
      attributeBackgroundColorOdd: '#FFFFFF',
      clusterBkg: '#F0F4FF',
      clusterBorder: '#B3CBF7',
      crit0: SOTATEK_ERROR,
      done0: SOTATEK_SUCCESS,
      edgeLabelBackground: '#FFFFFF',
      fontFamily: '"Inter Variable", system-ui, sans-serif',
      fontSize: '14px',
      git0: SOTATEK_BLUE,
      git1: SOTATEK_CYAN,
      git2: '#28A745',
      git3: SOTATEK_WARNING,
      git4: '#FF6B6B',
      git5: '#845EC2',
      git6: '#FF9671',
      git7: '#00CEC9',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#E6F7FF',
      labelBoxBorderColor: SOTATEK_CYAN,
      labelColor: '#1A1A1A',
      labelTextColor: '#1A1A1A',
      lineColor: SOTATEK_BLUE,
      loopTextColor: '#1A1A1A',
      mainBkg: '#D6E4FF',
      nodeBorder: SOTATEK_BLUE,
      noteBkgColor: '#FFF8E1',
      noteBorderColor: SOTATEK_WARNING,
      noteTextColor: '#1A1A1A',
      pie1: SOTATEK_BLUE,
      pie2: SOTATEK_CYAN,
      pie3: '#28A745',
      pie4: SOTATEK_WARNING,
      pie5: '#FF6B6B',
      pie6: '#845EC2',
      pie7: '#FF9671',
      primaryBorderColor: SOTATEK_BLUE,
      primaryColor: '#D6E4FF',
      primaryTextColor: '#1A1A1A',
      secondaryBorderColor: SOTATEK_CYAN,
      secondaryColor: '#E6F7FF',
      secondaryTextColor: '#1A1A1A',
      sequenceNumberColor: '#FFFFFF',
      signalColor: SOTATEK_BLUE,
      signalTextColor: '#1A1A1A',
      tertiaryBorderColor: '#28A745',
      tertiaryColor: '#F0FFF4',
      tertiaryTextColor: '#1A1A1A',
      titleColor: SOTATEK_BLUE
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
      activationBorderColor: SOTATEK_BLUE_BRIGHT,
      actorBkg: '#0A2A5E',
      actorBorder: SOTATEK_BLUE_BRIGHT,
      actorTextColor: '#E0E0E0',
      attributeBackgroundColorEven: '#0D1F3C',
      attributeBackgroundColorOdd: DARK_NAVY,
      clusterBkg: '#0D1F3C',
      clusterBorder: '#1E3A5F',
      crit0: SOTATEK_ERROR,
      done0: SOTATEK_SUCCESS,
      edgeLabelBackground: DARK_NAVY,
      fontFamily: '"Inter Variable", system-ui, sans-serif',
      fontSize: '14px',
      git0: SOTATEK_BLUE_BRIGHT,
      git1: SOTATEK_CYAN,
      git2: '#34D399',
      git3: SOTATEK_WARNING,
      git4: '#FF6B6B',
      git5: '#A78BFA',
      git6: '#FF9671',
      git7: '#00CEC9',
      gitBranchLabel0: '#FFFFFF',
      gitInv0: '#FFFFFF',
      labelBoxBkgColor: '#0D3354',
      labelBoxBorderColor: SOTATEK_CYAN,
      labelColor: '#E0E0E0',
      labelTextColor: '#E0E0E0',
      lineColor: SOTATEK_BLUE_BRIGHT,
      loopTextColor: '#E0E0E0',
      mainBkg: '#0A2A5E',
      nodeBorder: SOTATEK_BLUE_BRIGHT,
      noteBkgColor: '#2A2000',
      noteBorderColor: SOTATEK_WARNING,
      noteTextColor: '#E0E0E0',
      pie1: SOTATEK_BLUE_BRIGHT,
      pie2: SOTATEK_CYAN,
      pie3: '#34D399',
      pie4: SOTATEK_WARNING,
      pie5: '#FF6B6B',
      pie6: '#A78BFA',
      pie7: '#FF9671',
      primaryBorderColor: SOTATEK_BLUE_BRIGHT,
      primaryColor: '#0A2A5E',
      primaryTextColor: '#E0E0E0',
      secondaryBorderColor: SOTATEK_CYAN,
      secondaryColor: '#0D3354',
      secondaryTextColor: '#E0E0E0',
      sequenceNumberColor: '#FFFFFF',
      signalColor: SOTATEK_BLUE_BRIGHT,
      signalTextColor: '#E0E0E0',
      tertiaryBorderColor: '#34D399',
      tertiaryColor: '#0D3A2A',
      tertiaryTextColor: '#E0E0E0',
      titleColor: '#60A5FA'
    },
    svgPostProcess: { gradientStart: '#3B82F6', gradientEnd: '#60A5FA' }
  }
};
