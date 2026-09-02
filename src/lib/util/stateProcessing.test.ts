import { beforeEach, describe, expect, it, vi } from 'vitest';

const parseMock = vi.hoisted(() => vi.fn());

vi.mock('./mermaid', () => ({ parse: parseMock }));

import { updateCode, validatedState } from './state.svelte';

describe('state processing order', () => {
  beforeEach(() => parseMock.mockReset());

  it('does not let an older parse overwrite newer validated state', async () => {
    let resolveSlow: ((value: { diagramType: string }) => void) | undefined;
    const slowParse = new Promise<{ diagramType: string }>((resolve) => {
      resolveSlow = resolve;
    });
    parseMock.mockImplementation((code: string) =>
      typeof code === 'string' && code.includes('slow')
        ? slowParse
        : Promise.resolve({ diagramType: 'flowchart' })
    );

    updateCode('graph TD\n slow');
    updateCode('graph TD\n newest');
    await vi.waitFor(() => expect(validatedState.current.code).toBe('graph TD\n newest'));

    expect(resolveSlow).toBeDefined();
    resolveSlow?.({ diagramType: 'flowchart' });
    await slowParse;
    await Promise.resolve();
    expect(validatedState.current.code).toBe('graph TD\n newest');
  });
});
