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
	mermaid: any;
	updateEditor: boolean;
}
