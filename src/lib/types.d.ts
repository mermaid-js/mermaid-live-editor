/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Locals {
	userid: string;
}

export interface MarkerData {
	severity: number;
	message: string;
	source?: string;
	startLineNumber: number;
	startColumn: number;
	endLineNumber: number;
	endColumn: number;
}

export interface EditorUpdateEvent {
	text: string;
}
export interface EditorEvents {
	update: EditorUpdateEvent;
}

export interface TabEvents {
	select: Tab;
}

export interface Tab {
	id: string;
	title: string;
	icon: string;
}

export interface State {
	code: string;
	mermaid: string;
	updateEditor: boolean;
	updateDiagram: boolean;
	autoSync: boolean;
	panZoom?: boolean;
	pan?: { x: number; y: number };
	zoom?: number;
	loader?: LoaderConfig;
}

export interface ValidatedState extends State {
	error: unknown;
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
export interface LoaderConfig {
	type: 'gist' | 'files';
	config: GistLoaderConfig | FileLoaderConfig;
}
export type HistoryType = 'auto' | 'manual' | 'loader';
export interface HistoryEntry {
	state: State;
	time: number;
	name?: string;
	type: HistoryType;
	url?: string;
}

export interface DocConfig {
	[key: string]: {
		code: string;
		config?: string;
	};
}

export type Loader = (url: string) => Promise<State>;
