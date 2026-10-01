import { afterEach, describe, expect, it, vi } from 'vitest';
import { DIAGRAM_FILE_ACCEPT, loadDiagramFile, pickDiagramFile } from './diagramFile';
import { inputState, updateCodeStore } from './state.svelte';

const diagramFile = (code: string, name = 'diagram.mmd') =>
  new File([code], name, { type: 'text/plain' });

const findPickerInput = () => document.body.querySelector<HTMLInputElement>('input[type="file"]');

/** Simulates the browser filling the picker's input after the user chose a file. */
const chooseFile = (input: HTMLInputElement, file: File) => {
  Object.defineProperty(input, 'files', { configurable: true, value: [file] });
  input.dispatchEvent(new Event('change'));
};

afterEach(() => {
  findPickerInput()?.remove();
});

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

describe('pickDiagramFile', () => {
  it('opens a picker limited to diagram file types', () => {
    pickDiagramFile();

    const input = findPickerInput();
    expect(input).not.toBeNull();
    expect(input?.accept).toBe(DIAGRAM_FILE_ACCEPT);
    expect(DIAGRAM_FILE_ACCEPT.split(',')).toContain('.mmd');
  });

  it('loads the chosen file and removes the picker input', async () => {
    pickDiagramFile();
    const input = findPickerInput();
    if (!input) {
      throw new Error('picker input missing');
    }

    chooseFile(input, diagramFile('graph LR\n  Picked --> File'));

    await vi.waitFor(() => expect(inputState.code).toBe('graph LR\n  Picked --> File'));
    expect(document.body.contains(input)).toBe(false);
  });

  it('removes the picker input when the dialog is cancelled', () => {
    pickDiagramFile();
    const input = findPickerInput();
    if (!input) {
      throw new Error('picker input missing');
    }

    input.dispatchEvent(new Event('cancel'));

    expect(document.body.contains(input)).toBe(false);
  });
});
