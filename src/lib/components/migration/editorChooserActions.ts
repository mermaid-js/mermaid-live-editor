import type { EditorChooserVariant } from '$/util/experiments';
import { logEvent, logMermaidChartClick } from '$/util/stats';
import { getCheckoutUrl, getMermaidAiLiveUrl } from '$/util/util';

const utmMedium = 'editorSelection';

// See MC-4486: UTM campaign per variant for CTAs routing to mermaid.ai.
// The campaign defaults to the variant name; TestC's two trial CTAs are disambiguated
// by buttonClick so we can tell AI vs visual-editor clicks apart in analytics.
const testCUtmCampaignByButtonClick: Record<string, string> = {
  createWithAi: 'testCAi',
  useVisualEditor: 'testCVisual'
};

const resolveUtmCampaign = (variant: EditorChooserVariant, buttonClick: string): string => {
  if (variant === 'testC') {
    return testCUtmCampaignByButtonClick[buttonClick] ?? variant;
  }
  return variant;
};

export interface EditorChooserActions {
  log: (buttonClick: string) => void;
  startTrial: (buttonClick?: string) => void;
  dismiss: (buttonClick: string) => void;
  openMermaidAiLive: (buttonClick: string) => void;
}

export interface EditorChooserVariantProps {
  actions: EditorChooserActions;
}

export const createEditorChooserActions = (
  variant: EditorChooserVariant,
  close: () => void
): EditorChooserActions => {
  const log = (buttonClick: string) => {
    logEvent('chooseEditor', { buttonClick, variant });
  };

  const startTrial = (buttonClick = 'startTrial') => {
    log(buttonClick);
    logMermaidChartClick('editorPicker');
    close();
    window.open(
      getCheckoutUrl({
        utmCampaign: resolveUtmCampaign(variant, buttonClick),
        utmMedium
      }),
      '_blank'
    );
  };

  const dismiss = (buttonClick: string) => {
    log(buttonClick);
    close();
  };

  const openMermaidAiLive = (buttonClick: string) => {
    log(buttonClick);
    close();
    window.open(
      getMermaidAiLiveUrl({
        utmCampaign: resolveUtmCampaign(variant, buttonClick),
        utmMedium
      }),
      '_blank'
    );
  };

  return { log, startTrial, dismiss, openMermaidAiLive };
};
