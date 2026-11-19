import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  extractMermaidBlock,
  loadDiagramFile,
  replaceMermaidBlock,
  saveDiagramFile
} from './diagramFile';
import { inputState, updateCode, updateCodeStore } from './state.svelte';

const diagramFile = (code: string, name = 'diagram.mmd') =>
  new File([code], name, { type: 'text/plain' });

/** A fake FileSystemFileHandle that records what was written to it. */
const fakeHandle = (name: string) => {
  const written: string[] = [];
  const handle = {
    createWritable: () =>
      Promise.resolve({
        close: () => Promise.resolve(),
        write: (data: string) => {
          written.push(data);
          return Promise.resolve();
        }
      }),
    name
  } as unknown as FileSystemFileHandle;
  return { handle, written };
};

const markdown =
  '# Title\n\nBefore.\n\n```mermaid\ngraph TD\n  A --> B\n```\n\nAfter with $& signs.\n';

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

  it('loads the first mermaid block of a Markdown file', async () => {
    await loadDiagramFile(diagramFile(markdown, 'notes.md'));

    expect(inputState.code).toBe('graph TD\n  A --> B');
  });
});

describe('Markdown mermaid blocks', () => {
  it('extracts the first block', () => {
    expect(extractMermaidBlock(markdown)).toBe('graph TD\n  A --> B');
    expect(extractMermaidBlock('# No diagram')).toBeUndefined();
  });

  it('replaces only the block and keeps the rest verbatim', () => {
    expect(replaceMermaidBlock(markdown, 'graph TD\n  A --> C')).toBe(
      markdown.replace('A --> B', 'A --> C')
    );
  });
});

describe('saveDiagramFile', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes back to the opened file without asking again', async () => {
    const { handle, written } = fakeHandle('diagram.mmd');
    const showSaveFilePicker = vi.fn();
    vi.stubGlobal('showSaveFilePicker', showSaveFilePicker);

    await loadDiagramFile(diagramFile('graph LR\n  A --> B'), handle);
    updateCode('graph LR\n  A --> C');
    await saveDiagramFile();

    expect(written).toEqual(['graph LR\n  A --> C']);
    expect(showSaveFilePicker).not.toHaveBeenCalled();
  });

  it('updates only the mermaid block of a Markdown file and keeps its line endings', async () => {
    const crlfMarkdown = markdown.replaceAll('\n', '\r\n');
    const { handle, written } = fakeHandle('notes.md');
    vi.stubGlobal('showSaveFilePicker', vi.fn());

    await loadDiagramFile(diagramFile(crlfMarkdown, 'notes.md'), handle);
    updateCode('graph TD\n  A --> C');
    await saveDiagramFile();

    expect(written).toEqual([crlfMarkdown.replace('A --> B', 'A --> C')]);
  });

  it('asks for a location on save as', async () => {
    const opened = fakeHandle('diagram.mmd');
    const target = fakeHandle('copy.mmd');
    vi.stubGlobal('showSaveFilePicker', vi.fn().mockResolvedValue(target.handle));

    await loadDiagramFile(diagramFile('graph LR\n  A --> B'), opened.handle);
    await saveDiagramFile({ saveAs: true });

    expect(opened.written).toEqual([]);
    expect(target.written).toEqual(['graph LR\n  A --> B']);
  });
});
