import type { ErrorHash, MarkerData, State, ValidatedState } from '$lib/types';
import { debounce } from 'lodash-es';
import type { MermaidConfig } from 'mermaid';
import { derived, get, writable, type Readable } from 'svelte/store';
import { parse } from './mermaid';
import { localStorage, persist } from './persist';
import { deserializeState, serializeState } from './serde';
import { errorDebug, formatJSON } from './util';

export const defaultState: State = {
  code: `flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
  `,
  mermaid: formatJSON({
    theme: 'default'
  }),
  autoSync: true,
  rough: false,
  updateDiagram: true
};

const urlParseFailedState = `flowchart TD
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

export const currentState: ValidatedState = (() => {
  const state = get(inputStateStore);
  return {
    ...state,
    serialized: serializeState(state),
    errorMarkers: [],
    error: undefined,
    editorMode: state.editorMode ?? 'code'
  };
})();

const processState = async (state: State) => {
  const processed: ValidatedState = {
    ...state,
    serialized: '',
    errorMarkers: [],
    error: undefined,
    editorMode: state.editorMode ?? 'code'
  };
  // No changes should be done to fields part of `state`.
  try {
    processed.serialized = serializeState(state);
    await parse(state.code);
    JSON.parse(state.mermaid);
  } catch (error) {
    processed.error = error as Error;
    errorDebug();
    console.error(error);
    if ('hash' in error) {
      try {
        const {
          loc: { first_line, last_line, first_column, last_column }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        } = error.hash as ErrorHash;
        const marker: MarkerData = {
          severity: 8, // Error
          startLineNumber: first_line,
          startColumn: first_column,
          endLineNumber: last_line,
          endColumn: last_column + 1,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          message: error.str
        };
        processed.errorMarkers = [marker];
      } catch (error) {
        console.error('Error without line helper', error);
      }
    }
  }
  return processed;
};

// All internal reads should be done via stateStore, but it should not be persisted/shared externally.
export const stateStore: Readable<ValidatedState> = derived(
  [inputStateStore],
  ([state], set) => {
    void processState(state).then(set);
  },
  currentState
);

export const loadState = (data: string): void => {
  let state: State;
  console.log(`Loading '${data}'`);
  try {
    state = deserializeState(data);
    const mermaidConfig: MermaidConfig =
      typeof state.mermaid === 'string'
        ? (JSON.parse(state.mermaid) as MermaidConfig)
        : state.mermaid;
    if (
      mermaidConfig.securityLevel &&
      mermaidConfig.securityLevel !== 'strict' &&
      confirm(
        `Removing "securityLevel":"${mermaidConfig.securityLevel}" from the config for safety.\nClick Cancel if you trust the source of this Diagram.`
      )
    ) {
      delete mermaidConfig.securityLevel; // Prevent setting overriding securityLevel when loading state to mitigate possible XSS attack
    }
    state.mermaid = formatJSON(mermaidConfig);
  } catch (error) {
    state = get(inputStateStore);
    if (data) {
      console.error('Init error', error);
      state.code = urlParseFailedState;
      state.mermaid = defaultState.mermaid;
    }
  }
  updateCodeStore(state);
};

export const updateCodeStore = (newState: Partial<State>): void => {
  inputStateStore.update((state) => {
    return { ...state, ...newState };
  });
};

export const updateCode = (
  code: string,
  {
    updateDiagram = false,
    resetPanZoom = false
  }: { updateDiagram?: boolean; resetPanZoom?: boolean } = {}
): void => {
  errorDebug();

  inputStateStore.update((state) => {
    if (resetPanZoom) {
      state.pan = undefined;
      state.zoom = undefined;
    }
    return { ...state, code, updateDiagram };
  });
};

export const updateConfig = (config: string): void => {
  // console.log('updateConfig', config);
  inputStateStore.update((state) => {
    return { ...state, mermaid: config };
  });
};

export const toggleDarkTheme = (dark: boolean): void => {
  inputStateStore.update((state) => {
    const config = JSON.parse(state.mermaid) as MermaidConfig;
    if (!config.theme || ['dark', 'default'].includes(config.theme)) {
      config.theme = dark ? 'dark' : 'default';
    }

    return { ...state, mermaid: formatJSON(config) };
  });
};

export const initURLSubscription = (): void => {
  const updateHash = debounce((hash) => {
    history.replaceState(undefined, '', `#${hash}`);
  }, 250);

  stateStore.subscribe(({ serialized }) => {
    updateHash(serialized);
  });
};

export const getStateString = (): string => {
  return JSON.stringify(get(inputStateStore));
};
