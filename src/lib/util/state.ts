import { writable, get, derived } from 'svelte/store';
import { persist, localStorage } from '@macfja/svelte-persistent-store';
import { saveStatistics } from './stats';
import { serializeState, deserializeState } from './serde';
import { cmdKey } from './util';
import mermaid from 'mermaid';

import type { Readable } from 'svelte/store';
import type { MarkerData, State, ValidatedState } from '$lib/types';

export const defaultState: State = {
	code: `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
  `,
	mermaid: JSON.stringify(
		{
			theme: 'default'
		},
		null,
		2
	),
	updateEditor: false,
	autoSync: true,
	updateDiagram: true
};

const urlParseFailedState = `graph TD
    A[Loading URL failed. We can try to figure out why.] -->|Decode JSON| B(Please check the console to see the JSON and error details.)
    B --> C{Is the JSON correct?}
    C -->|Yes| D(Please Click here to Raise an issue in github.<br/>Including the broken link in the issue <br/> will speed up the fix.)
    C -->|No| E{Did someone <br/>send you this link?}
    E -->|Yes| F[Ask them to send <br/>you the complete link]
    E -->|No| G{Did you copy <br/> the complete URL?}
    G --> |Yes| D
    G --> |"No :("| H(Try using the Timeline tab in History <br/>from same browser you used to create the diagram.)
    click D href "https://github.com/mermaid-js/mermaid-live-editor/issues/new?assignees=&labels=bug&template=bug_report.md&title=Broken%20link" "Raise issue"`;

// inputStateStore handles all updates and is shared externally when exporting via URL, History, etc.
export const inputStateStore = persist(writable(defaultState), localStorage(), 'codeStore');

// All internal reads should be done via stateStore, but it should not be persisted/shared externally.
export const stateStore: Readable<ValidatedState> = derived([inputStateStore], ([state]) => {
	const processed: ValidatedState = {
		...state,
		serialized: '',
		errorMarkers: [],
		error: undefined
	};
	// No changes should be done to fields part of `state`.
	try {
		processed.serialized = serializeState(state);
		mermaid.parse(state.code);
		JSON.parse(state.mermaid);
	} catch (e) {
		processed.error = e;
		console.error(e);
		if (e.hash) {
			try {
				const marker: MarkerData = {
					severity: 8, // Error
					startLineNumber: e.hash.loc.first_line,
					startColumn: e.hash.loc.first_column,
					endLineNumber: e.hash.loc.last_line,
					endColumn: (e.hash.loc.last_column as number) + 1,
					message: e.str
				};
				processed.errorMarkers = [marker];
			} catch (err) {
				console.error('Error without line helper', err);
			}
		}
	}
	return processed;
});

export const loadState = (data: string): void => {
	let state: State;
	console.log(`Loading '${data}'`);
	try {
		state = deserializeState(data);
		const mermaidConfig: { [key: string]: string } =
			typeof state.mermaid === 'string' ? JSON.parse(state.mermaid) : state.mermaid;
		if (
			mermaidConfig.securityLevel &&
			mermaidConfig.securityLevel !== 'strict' &&
			confirm(
				`Removing "securityLevel":"${mermaidConfig.securityLevel}" from the config for safety.\nClick Cancel if you trust the source of this Diagram.`
			)
		) {
			delete mermaidConfig.securityLevel; // Prevent setting overriding securityLevel when loading state to mitigate possible XSS attack
		}
		state.mermaid = JSON.stringify(mermaidConfig, null, 2);
	} catch (e) {
		state = get(inputStateStore);
		if (data) {
			console.error('Init error', e);
			state.code = urlParseFailedState;
			state.mermaid = defaultState.mermaid;
		}
	}
	updateCodeStore({ ...state, updateEditor: true });
};

export const updateCodeStore = (newState: Partial<State>): void => {
	inputStateStore.update((state) => {
		return { ...state, ...newState };
	});
};

let prompted = false;
export const updateCode = (
	code: string,
	{
		updateEditor,
		updateDiagram = false,
		resetPanZoom = false
	}: { updateEditor: boolean; updateDiagram?: boolean; resetPanZoom?: boolean }
): void => {
	saveStatistics(code);
	const lines = (code.match(/\n/g) || '').length + 1;

	if (lines > 50 && !prompted && get(stateStore).autoSync) {
		const turnOff = confirm(
			`Long diagram detected. Turn off Auto Sync? Use ${cmdKey} + Enter or click the sync logo to manually sync.`
		);
		prompted = true;
		if (turnOff) {
			updateCodeStore({
				autoSync: false
			});
		}
	}

	inputStateStore.update((state) => {
		if (resetPanZoom) {
			state.pan = undefined;
			state.zoom = undefined;
		}
		return { ...state, code, updateEditor, updateDiagram };
	});
};

export const updateConfig = (config: string, updateEditor: boolean): void => {
	inputStateStore.update((state) => {
		return { ...state, mermaid: config, updateEditor };
	});
};

export const toggleDarkTheme = (dark: boolean): void => {
	inputStateStore.update((state) => {
		const config = JSON.parse(state.mermaid);
		if (!config.theme || ['dark', 'default'].includes(config.theme)) {
			config.theme = dark ? 'dark' : 'default';
		}

		return { ...state, mermaid: JSON.stringify(config, null, 2), updateEditor: true };
	});
};

export const initURLSubscription = (): void => {
	stateStore.subscribe(({ serialized }) => {
		history.replaceState(undefined, undefined, `#${serialized}`);
	});
};

export const getStateString = (): string => {
	return JSON.stringify(get(inputStateStore));
};
