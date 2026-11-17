import { C } from '#lib/constants.js';
import { readJSON, writeJSON } from '#lib/util/persist.svelte.js';
import { logEvent, logMermaidChartClick } from '#lib/util/stats.js';
import { getDiagramEditorUrl, getFlowSignUpUrl, getMermaidAiLiveUrl } from '#lib/util/util.js';

const utmMedium = 'editorSelection';
const utmCampaign = 'live_2026';

// Mermaid Flow launch experiment (Mermaid-Chart/collab#6752), split evenly:
// A shows the Visual Editor alone, B shows Mermaid Flow alone, C shows both.
export const editorChooserVariants = ['A', 'B', 'C'] as const;
export type EditorChooserVariant = (typeof editorChooserVariants)[number];

const isVariant = (value: unknown): value is EditorChooserVariant =>
  (editorChooserVariants as readonly unknown[]).includes(value);

/**
 * Each browser is randomly assigned one variant and keeps it, so clicks can be compared per
 * variant. `?editorChooser=A|B|C` shows a variant for QA without changing the assignment.
 */
export const getEditorChooserVariant = (): EditorChooserVariant => {
  const forced = new URLSearchParams(window.location.search).get('editorChooser');
  if (isVariant(forced)) return forced;
  const stored = readJSON<unknown>(C.editorChooserVariantKey, '');
  if (isVariant(stored)) return stored;
  const assigned = editorChooserVariants[Math.floor(Math.random() * editorChooserVariants.length)];
  writeJSON(C.editorChooserVariantKey, assigned);
  return assigned;
};

export interface EditorChooserActions {
  log: (buttonClick: string) => void;
  openVisualEditor: (buttonClick?: string) => void;
  tryFlow: (buttonClick?: string) => void;
  dismiss: (buttonClick: string) => void;
  openMermaidAiLive: (buttonClick: string) => void;
}

export const createEditorChooserActions = (
  close: () => void,
  variant: EditorChooserVariant
): EditorChooserActions => {
  const log = (buttonClick: string) => {
    logEvent('chooseEditor', { buttonClick, variant });
  };

  const openVisualEditor = (buttonClick = 'openVisualEditor') => {
    log(buttonClick);
    logMermaidChartClick('editorPicker');
    close();
    window.open(
      getDiagramEditorUrl({ utmCampaign: `flow_visual${variant}`, utmMedium }),
      '_blank',
      'noopener'
    );
  };

  const tryFlow = (buttonClick = 'tryFlow') => {
    log(buttonClick);
    logMermaidChartClick('editorPicker');
    close();
    window.open(
      getFlowSignUpUrl({ utmCampaign: `flow_flow${variant}`, utmMedium }),
      '_blank',
      'noopener'
    );
  };

  const dismiss = (buttonClick: string) => {
    log(buttonClick);
    close();
  };

  const openMermaidAiLive = (buttonClick: string) => {
    log(buttonClick);
    close();
    window.open(getMermaidAiLiveUrl({ utmCampaign, utmMedium }), '_blank', 'noopener');
  };

  return { dismiss, log, openMermaidAiLive, openVisualEditor, tryFlow };
};
