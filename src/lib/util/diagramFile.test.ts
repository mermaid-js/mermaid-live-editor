import { describe, expect, it } from 'vitest';
import { loadDiagramFile } from './diagramFile';
import { inputState, updateCodeStore } from './state.svelte';

const diagramFile = (code: string, name = 'diagram.mmd') =>
  new File([code], name, { type: 'text/plain' });

describe('loadDiagramFile', () => {
  it('replaces the diagram code with the file contents', async () => {
    await loadDiagramFile(diagramFile('graph LR\n  Loaded --> FromFile'));

    expect(inputState.code).toBe('graph LR\n  Loaded --> FromFile');
  });

  it('resets pan and zoom like loading a sample does', async () => {
    updateCodeStore({ pan: { x: 12, y: 34 }, zoom: 2 });

    await loadDiagramFile(diagramFile('graph LR\n  A --> B'));

    expect(inputState.pan).toBeUndefined();
    expect(inputState.zoom).toBeUndefined();
  });
});
