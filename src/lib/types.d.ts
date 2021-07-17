/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Locals {
	userid: string;
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
	loader?: LoaderConfig;
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

type Loader = (url: string) => Promise<State>;
