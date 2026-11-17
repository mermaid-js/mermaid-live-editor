import { C } from '#lib/constants.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createEditorChooserActions,
  editorChooserVariants,
  getEditorChooserVariant
} from './editorChooserActions';

const stored = () => JSON.parse(localStorage.getItem(C.editorChooserVariantKey) ?? '""');

describe('editor chooser variant', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('assigns a random variant once and keeps it', () => {
    const variant = getEditorChooserVariant();
    expect(editorChooserVariants).toContain(variant);
    expect(stored()).toBe(variant);
    expect(getEditorChooserVariant()).toBe(variant);
  });

  it('splits variants evenly', () => {
    const counts = { A: 0, B: 0, C: 0 };
    for (let i = 0; i < 3000; i++) {
      localStorage.clear();
      counts[getEditorChooserVariant()]++;
    }
    for (const count of Object.values(counts)) {
      expect(count).toBeGreaterThan(900);
    }
  });

  it('replaces an unknown stored variant', () => {
    localStorage.setItem(C.editorChooserVariantKey, JSON.stringify('D'));
    expect(editorChooserVariants).toContain(getEditorChooserVariant());
  });

  it('shows a variant forced from the URL without changing the assignment', () => {
    localStorage.setItem(C.editorChooserVariantKey, JSON.stringify('A'));
    window.history.replaceState(null, '', '/?editorChooser=B');
    expect(getEditorChooserVariant()).toBe('B');
    expect(stored()).toBe('A');
  });
});

describe('editor chooser campaigns', () => {
  const opened = () => new URL(vi.mocked(window.open).mock.calls[0][0] as string);

  beforeEach(() => {
    vi.spyOn(window, 'open').mockReturnValue(null);
  });
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['A', 'openVisualEditor', 'flow_visualA'],
    ['B', 'tryFlow', 'flow_flowB'],
    ['C', 'tryFlow', 'flow_flowC'],
    ['C', 'openVisualEditor', 'flow_visualC']
  ] as const)('variant %s %s links with %s', (variant, action, campaign) => {
    const close = vi.fn();
    createEditorChooserActions(close, variant)[action]();
    expect(close).toHaveBeenCalled();
    expect(opened().searchParams.get('utm_campaign')).toBe(campaign);
  });
});
