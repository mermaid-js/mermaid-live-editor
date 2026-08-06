import { describe, expect, it } from 'vitest';
import {
  getAccessibilityMetadata,
  getPresentationSettings,
  setAccessibilityMetadata,
  updatePresentationConfig
} from './presentation';

describe('presentation config helpers', () => {
  it('reads layout, look, and hand-drawn seed from Mermaid config', () => {
    expect(
      getPresentationSettings(
        '{"theme":"default","layout":"elk","look":"handDrawn","handDrawnSeed":7}'
      )
    ).toEqual({
      handDrawnSeed: 7,
      layout: 'elk',
      look: 'handDrawn'
    });
  });

  it('writes selected layout and look while preserving other config keys', () => {
    expect(
      updatePresentationConfig('{"theme":"default"}', {
        handDrawnSeed: 12,
        layout: 'elk.force',
        look: 'handDrawn'
      })
    ).toBe(
      JSON.stringify(
        {
          theme: 'default',
          layout: 'elk.force',
          look: 'handDrawn',
          handDrawnSeed: 12
        },
        undefined,
        2
      )
    );
  });

  it('removes optional presentation keys when default options are selected', () => {
    expect(
      updatePresentationConfig(
        '{"theme":"default","layout":"elk","look":"handDrawn","handDrawnSeed":4}',
        {
          layout: 'default',
          look: 'default'
        }
      )
    ).toBe(JSON.stringify({ theme: 'default' }, undefined, 2));
  });
});

describe('accessibility metadata helpers', () => {
  it('reads existing accessibility lines', () => {
    expect(
      getAccessibilityMetadata(
        'flowchart TD\n  accTitle: Checkout flow\n  accDescr: Payment states'
      )
    ).toEqual({
      description: 'Payment states',
      title: 'Checkout flow'
    });
  });

  it('inserts missing metadata after the diagram declaration', () => {
    expect(
      setAccessibilityMetadata('flowchart TD\n  A --> B', {
        description: 'Payment states',
        title: 'Checkout flow'
      })
    ).toBe('flowchart TD\n    accTitle: Checkout flow\n    accDescr: Payment states\n  A --> B');
  });

  it('inserts missing metadata after frontmatter and the diagram declaration', () => {
    expect(
      setAccessibilityMetadata('---\nconfig:\n  theme: default\n---\nflowchart TD\n  A --> B', {
        description: '',
        title: 'Checkout flow'
      })
    ).toBe(
      '---\nconfig:\n  theme: default\n---\nflowchart TD\n    accTitle: Checkout flow\n  A --> B'
    );
  });

  it('updates and removes existing metadata', () => {
    expect(
      setAccessibilityMetadata(
        'flowchart TD\n  accTitle: Old title\n  accDescr: Old description\n  A --> B',
        {
          description: '',
          title: 'New title'
        }
      )
    ).toBe('flowchart TD\n  accTitle: New title\n  A --> B');
  });
});
