import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEditorChooserActions } from './editorChooserActions';

describe('editor chooser campaigns', () => {
  const opened = () => new URL(vi.mocked(window.open).mock.calls[0][0] as string);

  beforeEach(() => {
    vi.spyOn(window, 'open').mockReturnValue(null);
  });
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['tryFlow', 'flow_nov26'],
    ['openVisualEditor', 'visual_editor_nov26']
  ] as const)('%s links with %s', (action, campaign) => {
    const close = vi.fn();
    createEditorChooserActions(close)[action]();
    expect(close).toHaveBeenCalled();
    expect(opened().searchParams.get('utm_campaign')).toBe(campaign);
  });
});
