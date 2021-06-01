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
}

export interface HistoryEntry {
	state: State;
	time: number;
	name?: string;
	auto: boolean;
}
