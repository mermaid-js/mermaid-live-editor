/**
 * Diagram-specific layout configs shared across all themes.
 * Massive spacing (150%+ increase) to eliminate overlap.
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
