/// <reference types="@sveltejs/kit" />

interface EditorUpdateEvent {
	text: string;
}
interface EditorEvents {
	update: EditorUpdateEvent;
}
