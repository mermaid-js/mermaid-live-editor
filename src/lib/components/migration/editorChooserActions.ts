import { logEvent, logMermaidChartClick } from '#lib/util/stats.js';
import { getDiagramEditorUrl, getFlowSignUpUrl, getMermaidAiLiveUrl } from '#lib/util/util.js';

const utmMedium = 'editorSelection';
const utmCampaign = 'live_2026';

export interface EditorChooserActions {
  log: (buttonClick: string) => void;
  openVisualEditor: (buttonClick?: string) => void;
  tryFlow: (buttonClick?: string) => void;
  dismiss: (buttonClick: string) => void;
  openMermaidAiLive: (buttonClick: string) => void;
}

export const createEditorChooserActions = (close: () => void): EditorChooserActions => {
  const log = (buttonClick: string) => {
    logEvent('chooseEditor', { buttonClick });
  };

  const openVisualEditor = (buttonClick = 'openVisualEditor') => {
    log(buttonClick);
    logMermaidChartClick('editorPicker');
    close();
    window.open(
      getDiagramEditorUrl({ utmCampaign: 'visual_editor_nov26', utmMedium }),
      '_blank',
      'noopener'
    );
  };

  const tryFlow = (buttonClick = 'tryFlow') => {
    log(buttonClick);
    logMermaidChartClick('editorPicker');
    close();
    window.open(getFlowSignUpUrl({ utmCampaign: 'flow_nov26', utmMedium }), '_blank', 'noopener');
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
