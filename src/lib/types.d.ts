import type { Component } from 'svelte';
import type { HTMLInputTypeAttribute } from 'svelte/elements';
import 'unplugin-icons/types/svelte';

export interface MarkerData {
  severity: number;
  message: string;
  source?: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface TabEvents {
  select: Tab;
}

export interface Tab {
  id: string;
  title: string;
  icon: Component;
}

export interface State {
  code: string;
  mermaid: string;
  updateDiagram: boolean;
  rough: boolean;
  // All new options must be optional, as users would have old states saved
  renderCount?: number;
  panZoom?: boolean;
  grid?: boolean;
  editorMode?: EditorMode;
  pan?: { x: number; y: number };
  zoom?: number;
  loader?: LoaderConfig;
}

export interface ValidatedState extends State {
  editorMode: EditorMode;
  diagramType?: string;
  error?: Error;
  errorMarkers: MarkerData[];
  serialized: string;
}

export interface GistLoaderConfig {
  url: string;
}

export interface LoadingState {
  loading: boolean;
  message?: string;
}
export interface FileLoaderConfig {
  codeURL: string;
  configURL?: string;
}
export type LoaderConfig =
  | {
      type: 'gist';
      config: GistLoaderConfig;
    }
  | {
      type: 'files';
      config: FileLoaderConfig;
    };
export type HistoryType = 'auto' | 'manual' | 'loader';
export type HistoryEntry = { id: string; state: State; time: number; url?: string } & (
  | {
      type: 'loader';
      name: string;
    }
  | {
      type: HistoryType;
      name?: string;
    }
);

export type DocumentationConfig = Record<
  string,
  {
    code: string;
    config?: string;
  }
>;

export type EditorMode = 'code' | 'config';

export type Loader = (url: string) => Promise<State>;
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface ErrorHash {
  loc: {
    first_line: number;
    last_line: number;
    first_column: number;
    last_column: number;
  };
}

export type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

export interface EditorProps {
  onUpdate: (text: string) => void;
}
