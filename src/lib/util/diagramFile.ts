import { downloadMMD } from './export';
import { inputState, updateCode } from './state.svelte';
import { logEvent } from './stats';

// File System Access API pickers (Chromium only); not part of TypeScript's DOM lib yet.
interface FilePickerOptions {
  suggestedName?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
}
type FilePickerWindow = Window & {
  showOpenFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle>;
};
const pickerWindow = () => window as FilePickerWindow;

const fileTypes: FilePickerOptions['types'] = [
  { accept: { 'text/plain': ['.mmd', '.mermaid', '.md', '.txt'] }, description: 'Mermaid diagram' }
];

const MERMAID_BLOCK = /(```mermaid[^\n]*\n)([\s\S]*?)(\r?\n?```)/;

/** Returns the code of the first ```mermaid block in a Markdown document. */
export const extractMermaidBlock = (markdown: string): string | undefined =>
  MERMAID_BLOCK.exec(markdown)?.[2];

/** Replaces the code of the first ```mermaid block, leaving the rest of the document untouched. */
export const replaceMermaidBlock = (markdown: string, code: string): string =>
  markdown.replace(MERMAID_BLOCK, (_match, open: string, _old: string, close: string) => {
    return `${open}${code}${close}`;
  });

// The file the current diagram was opened from or saved to, so Ctrl+S can write back to it.
let currentFile:
  | { handle?: FileSystemFileHandle; markdown?: string; lineEnding: string; name: string }
  | undefined;

export const supportsFileAccess = (): boolean =>
  typeof window !== 'undefined' && 'showSaveFilePicker' in window;

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

/** Replaces the diagram code with the file's contents, the same way loading a sample does. */
export const loadDiagramFile = async (file: File, handle?: FileSystemFileHandle): Promise<void> => {
  const text = await file.text();
  const block = /\.md$/i.test(file.name) ? extractMermaidBlock(text) : undefined;
  currentFile = {
    handle,
    lineEnding: text.includes('\r\n') ? '\r\n' : '\n',
    markdown: block === undefined ? undefined : text,
    name: file.name
  };
  updateCode(block ?? text, { resetPanZoom: true, updateDiagram: true });
  logEvent('loadFile');
};

/** Opens the browser's file picker for a diagram file and loads the chosen one. */
export const pickDiagramFile = async (): Promise<void> => {
  const { showOpenFilePicker } = pickerWindow();
  if (showOpenFilePicker) {
    try {
      const [handle] = await showOpenFilePicker({ types: fileTypes });
      await loadDiagramFile(await handle.getFile(), handle);
    } catch (error) {
      if (!isAbortError(error)) throw error;
    }
    return;
  }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.mmd,.mermaid,.md,.txt';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) {
      void loadDiagramFile(file);
    }
  });
  input.click();
};

/**
 * Writes the diagram back to the file it was opened from (or asks where to save it).
 * Without File System Access API support it falls back to downloading an .mmd file.
 */
export const saveDiagramFile = async ({ saveAs = false } = {}): Promise<void> => {
  const { showSaveFilePicker } = pickerWindow();
  if (!showSaveFilePicker) {
    downloadMMD();
    return;
  }
  let handle = saveAs ? undefined : currentFile?.handle;
  if (!handle) {
    try {
      handle = await showSaveFilePicker({
        suggestedName: currentFile?.name ?? 'diagram.mmd',
        types: fileTypes
      });
    } catch (error) {
      if (isAbortError(error)) return;
      throw error;
    }
  }
  const lineEnding = currentFile?.lineEnding ?? '\n';
  const code = inputState.code.replaceAll(/\r?\n/g, lineEnding);
  const markdown = /\.md$/i.test(handle.name) ? currentFile?.markdown : undefined;
  const content = markdown === undefined ? code : replaceMermaidBlock(markdown, code);

  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
  currentFile = { handle, lineEnding, markdown: markdown && content, name: handle.name };
  logEvent('saveFile');
};
