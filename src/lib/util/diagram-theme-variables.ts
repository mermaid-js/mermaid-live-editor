/**
 * Mermaid themeVariables for SotaTek brand identity.
 * Used with `theme: 'base'` to fully control diagram colors/fonts.
 * Light and dark variants auto-applied based on mode-watcher state.
 */

/** SotaTek palette constants */
const SOTATEK_BLUE = '#0052CC';
const SOTATEK_CYAN = '#00B4DB';
const SOTATEK_SUCCESS = '#00FF88';
const SOTATEK_ERROR = '#FF4D4D';
const SOTATEK_WARNING = '#FFB300';
const DARK_NAVY = '#0A192F';

/** Light mode themeVariables for mermaid's base theme */
export const lightThemeVariables: Record<string, string> = {
  activationBkgColor: '#E6F0FF',
  activationBorderColor: SOTATEK_BLUE,

  // Sequence diagram
  actorBkg: '#D6E4FF',
  actorBorder: SOTATEK_BLUE,
  actorTextColor: '#1A1A1A',

  // ER diagram
  attributeBackgroundColorEven: '#F5F8FF',
  attributeBackgroundColorOdd: '#FFFFFF',
  clusterBkg: '#F0F4FF',
  clusterBorder: '#B3CBF7',

  // Gantt
  crit0: SOTATEK_ERROR,
  done0: SOTATEK_SUCCESS,

  // Edge labels
  edgeLabelBackground: '#FFFFFF',
  fontFamily: '"Inter Variable", system-ui, sans-serif',

  // Typography
  fontSize: '14px',

  // Git graph
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

  // State diagram
  labelColor: '#1A1A1A',
  labelTextColor: '#1A1A1A',
  lineColor: SOTATEK_BLUE,
  loopTextColor: '#1A1A1A',
  mainBkg: '#D6E4FF',

  // Flowchart
  nodeBorder: SOTATEK_BLUE,

  // Notes
  noteBkgColor: '#FFF8E1',
  noteBorderColor: SOTATEK_WARNING,
  noteTextColor: '#1A1A1A',

  // Pie chart
  pie1: SOTATEK_BLUE,
  pie2: SOTATEK_CYAN,
  pie3: '#28A745',
  pie4: SOTATEK_WARNING,
  pie5: '#FF6B6B',
  pie6: '#845EC2',
  pie7: '#FF9671',
  primaryBorderColor: SOTATEK_BLUE,
  // Core palette
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
};

/** Dark mode themeVariables for mermaid's base theme */
export const darkThemeVariables: Record<string, string> = {
  activationBkgColor: '#1E3A5F',
  activationBorderColor: '#3B82F6',

  // Sequence diagram
  actorBkg: '#0A2A5E',
  actorBorder: '#3B82F6',
  actorTextColor: '#E0E0E0',

  // ER diagram
  attributeBackgroundColorEven: '#0D1F3C',
  attributeBackgroundColorOdd: '#0A192F',
  clusterBkg: '#0D1F3C',
  clusterBorder: '#1E3A5F',

  // Gantt
  crit0: SOTATEK_ERROR,
  done0: SOTATEK_SUCCESS,

  // Edge labels
  edgeLabelBackground: DARK_NAVY,
  fontFamily: '"Inter Variable", system-ui, sans-serif',

  // Typography
  fontSize: '14px',

  // Git graph
  git0: '#3B82F6',
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

  // State diagram
  labelColor: '#E0E0E0',
  labelTextColor: '#E0E0E0',
  lineColor: '#3B82F6',
  loopTextColor: '#E0E0E0',
  mainBkg: '#0A2A5E',

  // Flowchart
  nodeBorder: '#3B82F6',

  // Notes
  noteBkgColor: '#2A2000',
  noteBorderColor: SOTATEK_WARNING,
  noteTextColor: '#E0E0E0',

  // Pie chart
  pie1: '#3B82F6',
  pie2: SOTATEK_CYAN,
  pie3: '#34D399',
  pie4: SOTATEK_WARNING,
  pie5: '#FF6B6B',
  pie6: '#A78BFA',
  pie7: '#FF9671',
  primaryBorderColor: '#3B82F6',
  // Core palette — deep navy fills with bright borders
  primaryColor: '#0A2A5E',
  primaryTextColor: '#E0E0E0',
  secondaryBorderColor: SOTATEK_CYAN,
  secondaryColor: '#0D3354',
  secondaryTextColor: '#E0E0E0',
  sequenceNumberColor: '#FFFFFF',
  signalColor: '#3B82F6',
  signalTextColor: '#E0E0E0',
  tertiaryBorderColor: '#34D399',
  tertiaryColor: '#0D3A2A',
  tertiaryTextColor: '#E0E0E0',
  titleColor: '#60A5FA'
};

/**
 * Diagram-specific layout configs — massive spacing (150%+ increase)
 * to eliminate overlap and create clean "Blueprint" separation.
 * Covers all 9 target diagram types uniformly.
 * Note: Use Case/Activity/Component/Deployment are flowchart variants in mermaid.
 */
export const diagramLayoutConfig = {
  class: {
    diagramPadding: 40,
    nodeSpacing: 100,
    rankSpacing: 80
  },
  er: {
    diagramPadding: 40,
    entityPadding: 20,
    minEntityHeight: 60,
    minEntityWidth: 120
  },
  flowchart: {
    curve: 'monotoneY' as const,
    diagramPadding: 40,
    htmlLabels: true,
    nodeSpacing: 120,
    padding: 25,
    rankSpacing: 100,
    useMaxWidth: true,
    wrappingWidth: 250
  },
  sequence: {
    actorMargin: 120,
    diagramMarginX: 50,
    diagramMarginY: 30,
    messageMargin: 50,
    mirrorActors: true,
    noteMargin: 20
  },
  state: {
    diagramPadding: 40,
    nodeSpacing: 80,
    rankSpacing: 80
  }
};
