import { describe, expect, it } from 'vitest';
import { getDiagramEditorUrl, getFlowSignUpUrl } from './util';

const utmMedium = 'editorSelection';

describe('mermaid.ai CTA URLs', () => {
  it('signs up into Mermaid Flow with the campaign attached', () => {
    const url = new URL(getFlowSignUpUrl({ utmCampaign: 'flow_flowC', utmMedium }));
    expect(url.pathname).toBe('/app/sign-up');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      redirect: '/flow/new',
      utm_campaign: 'flow_flowC',
      utm_medium: utmMedium,
      utm_source: 'mermaid_live_editor'
    });
  });

  it('opens the diagram editor cold start with the campaign attached', () => {
    const url = new URL(getDiagramEditorUrl({ utmCampaign: 'flow_visualC', utmMedium }));
    expect(url.pathname).toBe('/app/diagrams/new');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      entryPoint: 'onboarding',
      utm_campaign: 'flow_visualC',
      utm_medium: utmMedium,
      utm_source: 'mermaid_live_editor'
    });
  });
});
