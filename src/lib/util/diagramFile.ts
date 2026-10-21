import { updateCode } from './state.svelte';
import { logEvent } from './stats';

/** Extensions the picker offers; mermaid's CLI and most editor plugins use .mmd. */
export const DIAGRAM_FILE_ACCEPT = '.mmd,.mermaid,.txt';

/** Replaces the diagram code with the file's contents, the same way loading a sample does. */
export const loadDiagramFile = async (file: File): Promise<void> => {
  updateCode(await file.text(), { resetPanZoom: true, updateDiagram: true });
  logEvent('loadFile');
};

/**
 * Opens the browser's file picker for a diagram file and loads the chosen one.
 * The input is created on demand so any button or menu entry can trigger it
 * without owning a hidden element, and removed once the dialog closes.
 */
export const pickDiagramFile = (): void => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = DIAGRAM_FILE_ACCEPT;
  input.hidden = true;
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    input.remove();
    if (file) {
      void loadDiagramFile(file);
    }
  });
  input.addEventListener('cancel', () => input.remove());
  document.body.append(input);
  input.click();
};
