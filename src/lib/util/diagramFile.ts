import { updateCode } from './state.svelte';
import { logEvent } from './stats';

/** Replaces the diagram code with the file's contents, the same way loading a sample does. */
export const loadDiagramFile = async (file: File): Promise<void> => {
  updateCode(await file.text(), { resetPanZoom: true, updateDiagram: true });
  logEvent('loadFile');
};

/** Opens the browser's file picker for a diagram file and loads the chosen one. */
export const pickDiagramFile = (): void => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.mmd,.mermaid,.txt';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) {
      void loadDiagramFile(file);
    }
  });
  input.click();
};
