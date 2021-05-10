import { writable } from 'svelte/store';
import { encode, decode } from 'js-base64';

const defaultState: State = {
	code: `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
  `,
	mermaid: 'default',
	updateEditor: false
};

export const codeStore = writable(defaultState);

export const loadState = (data: string): void => {
	let state: State;
	try {
		const stateStr = decode(data);
		console.log('state from url', stateStr);
		state = JSON.parse(stateStr);
	} catch (e) {
		console.error('Init error', e);
		state = defaultState;
	}
	codeStore.set({ ...state, updateEditor: true });
};

export const updateCodeStore = (newState: State): void => {
	codeStore.set(newState);
};

export const updateCode = (code: string, updateEditor: boolean): void => {
	codeStore.update((state) => {
		return { ...state, code, updateEditor };
	});
};

export const updateConfig = (config: any, updateEditor: boolean): void => {
	codeStore.update((state) => {
		return { ...state, mermaid: config, updateEditor };
	});
};

export const initURLSubscription = (): void => {
	codeStore.subscribe((state: State) => {
		window.location.hash = encode(JSON.stringify(state), true);
	});
};
