/// <reference types="@sveltejs/kit" />

interface EditorUpdateEvent {
	text: string;
}
interface EditorEvents {
	update: EditorUpdateEvent;
}

interface TabEvents {
	select: Tab;
}

interface Tab {
	id: string;
	title: string;
}

interface State {
	code: string;
	mermaid: string;
	updateEditor: boolean;
	updateDiagram: boolean;
	autoSync: boolean;
}

interface HistoryEntry {
	state: State;
	time: number;
	name: string;
	auto: boolean;
}
