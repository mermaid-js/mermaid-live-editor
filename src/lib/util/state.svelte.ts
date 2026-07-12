import type { ErrorHash, MarkerData, State, ValidatedState } from '$/types';
import { resolve } from '$app/paths';
import { debounce, get as lodashGet } from 'lodash-es';
import type { MermaidConfig } from 'mermaid';
import { untrack } from 'svelte';
import { env } from './env';
import {
  extractErrorLineText,
  findMostRelevantLineNumber,
  replaceLineNumberInErrorMessage
} from './errorHandling';
import { defaultMermaidConfig, parse } from './mermaid';
import { readJSON, writeJSON } from './persist.svelte';
import { deserializeState, pakoSerde, serializeState } from './serde';
import { errorDebug, formatJSON, getUTMSource, MCBaseURL } from './util';

export const defaultState: State = {
  code: `flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
  `,
  grid: true,
  mermaid: formatJSON({
    theme: 'default'
  }),
  panZoom: true,
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

const CODE_STORE_KEY = 'codeStore';

// The single mutable input state; only update() below may write to it.
// The fallback is cloned so mutations never write through to defaultState.
const input = $state<State>(readJSON(CODE_STORE_KEY, { ...defaultState }));

// inputState is shared externally when exporting via URL, History, etc.
// It is reactive for reads; the read-only type keeps writes inside this
// module, where update() persists and re-validates every change.
export const inputState: Readonly<State> = input;

const validatedStateOf = (state: State, serialized: string): ValidatedState => ({
  ...state,
  editorMode: state.editorMode ?? 'code',
  error: undefined,
  errorMarkers: [],
  serialized
});

const initialState = $state.snapshot(input) as State;
// Only ever replaced wholesale, so raw (shallow) reactivity is enough.
let validatedCurrent = $state.raw<ValidatedState>(
  validatedStateOf(initialState, serializeState(initialState))
);

let lastDiagramType = '';

const processState = async (state: State) => {
  const processed = validatedStateOf(state, '');
  // No changes should be done to fields part of `state`.
  try {
    processed.serialized = serializeState(state);
    const { diagramType } = await parse(state.code);
    processed.diagramType = diagramType;
    if (lastDiagramType === 'zenuml' && diagramType !== lastDiagramType) {
      // Temp Hack to refresh page after displaying ZenUML.
      setTimeout(() => window.location.reload(), 500);
    }
    lastDiagramType = diagramType;
    JSON.parse(state.mermaid);
  } catch (error) {
    processed.error = error as Error;
    errorDebug();
    console.error(error);
    if (error && typeof error === 'object' && 'hash' in error) {
      try {
        let errorString = processed.error.toString();
        const errorLineText = extractErrorLineText(errorString);
        const realLineNumber = findMostRelevantLineNumber(errorLineText, state.code);

        let first_line: number, last_line: number, first_column: number, last_column: number;
        try {
          ({ first_line, last_line, first_column, last_column } = (error.hash as ErrorHash).loc);
        } catch {
          const lineNo = findMostRelevantLineNumber(errorString, state.code);
          first_line = lineNo;
          last_line = lineNo + 1;
          first_column = 0;
          last_column = 0;
        }

        if (realLineNumber !== -1) {
          errorString = replaceLineNumberInErrorMessage(errorString, realLineNumber);
        }

        processed.error = new Error(errorString);
        const marker: MarkerData = {
          endColumn: last_column + (first_column === last_column ? 0 : 5),
          endLineNumber: last_line + (realLineNumber - first_line),
          message: errorString || 'Syntax error',
          severity: 8, // Error
          startColumn: first_column,
          startLineNumber: realLineNumber
        };
        processed.errorMarkers = [marker];
      } catch (error) {
        console.error('Error without line helper', error);
      }
    }
  }
  return processed;
};

// Replaces the old URL-hash store subscription; assigned by initURLSubscription.
let updateHash: ((serialized: string) => void) | undefined;

// Persist the current input state and asynchronously re-validate it,
// publishing the result to `validatedState` (and the URL hash, once
// initURLSubscription has run). Only called from update(), which suppresses
// dependency tracking.
const persistAndProcess = (): void => {
  const snapshot = $state.snapshot(input) as State;
  writeJSON(CODE_STORE_KEY, snapshot);
  void processState(snapshot).then((processed) => {
    validatedCurrent = processed;
    updateHash?.(processed.serialized);
  });
};

// The single mutation gateway: every update function funnels its writes
// through here. The mutator runs untracked so effects that call an update
// function never subscribe to the input state it reads, and the trailing
// persist + re-validate cannot be forgotten by a new update function.
const update = (mutate: (state: State) => void): void => {
  untrack(() => {
    mutate(input);
    persistAndProcess();
  });
};

// All internal reads should be done via validatedState, but it should not be
// persisted/shared externally.
export const validatedState = {
  get current(): ValidatedState {
    return validatedCurrent;
  }
};

const urlsCurrent = $derived.by(() => {
  const { code, serialized } = validatedCurrent;
  const { krokiRendererUrl, rendererUrl } = env;
  const png = rendererUrl ? `${rendererUrl}/img/${serialized}?type=png` : '';
  return {
    kroki: krokiRendererUrl ? `${krokiRendererUrl}/mermaid/svg/${pakoSerde.serialize(code)}` : '',
    mdCode: png ? `[![](${png})](${window.location.href})` : '',
    mermaidChart: ({
      medium,
      campaign
    }: {
      medium:
        | 'ai_edit'
        | 'ai_repair'
        | 'main_menu'
        | 'save_diagram'
        | 'share'
        | 'vibe_diagramming'
        | 'visual_edit'
        | 'voice_edit';
      campaign?: string;
    }) => {
      const utmSource = getUTMSource();
      const params = new URLSearchParams({
        utm_source: utmSource,
        utm_medium: medium,
        ...(campaign ? { utm_campaign: campaign } : {})
      }).toString();
      return {
        save: `${MCBaseURL}/app/plugin/save?state=${serialized}&${params}`,
        playground: `${MCBaseURL}/play?${params}#${serialized}`,
        plugins: `${MCBaseURL}/plugins?${params}`,
        home: `${MCBaseURL}/?${params}`
      };
    },
    new: `${resolve('/edit', {})}#${serializeState(defaultState)}`,
    png,
    svg: rendererUrl ? `${rendererUrl}/svg/${serialized}` : '',
    view: `${resolve('/view', {})}#${serialized}`
  };
});

export const urls = {
  get current() {
    return urlsCurrent;
  }
};

/**
 * Gets a list of paths that contain unsafe keys which might pose security risks.
 *
 * @param object - The object to check for unsafe keys.
 * @param unsafeKeys - List of unsafe keys.
 * @param path - The current path being checked (used for recursion).
 * @returns List of unsafe paths.
 */
function getUnsafePaths(object: object, unsafeKeys: string[], path: string[] = []) {
  const unsafePaths = new Array<string[]>();
  for (const key of unsafeKeys) {
    // Copied from mermaid's sanitize function in case there's non-enumerable keys
    if (Object.hasOwn(object, key)) {
      unsafePaths.push([...path, key]);
      continue;
    }
  }
  Object.keys(object).forEach((key) => {
    const value = (object as Record<string, unknown>)[key];
    const currentPath = [...path, key];
    // Prototype pollution check.
    if (key.startsWith('__')) {
      unsafePaths.push(currentPath);
      return;
    }
    if (typeof value === 'object' && value !== null) {
      unsafePaths.push(...getUnsafePaths(value as object, unsafeKeys, currentPath));
    } else if (
      typeof value === 'string' &&
      // XSS prevention checks -- See mermaid `sanitize` function for reference.
      (value.includes('<') || value.includes('>') || value.includes('url(data:'))
    ) {
      unsafePaths.push(currentPath);
    }
  });
  return unsafePaths;
}

/**
 * Asks the user for confirmation if the config contains settings that might
 * pose security risks, such as a relaxed `securityLevel`.
 *
 * @param config - The Mermaid configuration to sanitize.
 * @returns The sanitized Mermaid configuration as a JSON string.
 */
export const sanitizeConfig = (config: string | MermaidConfig) => {
  const mermaidConfig: MermaidConfig =
    typeof config === 'string' ? (JSON.parse(config) as MermaidConfig) : config;

  const secureKeys = defaultMermaidConfig.secure ?? [];
  const unsafePaths = getUnsafePaths(mermaidConfig, secureKeys).filter((path) => {
    return lodashGet(mermaidConfig, path) !== lodashGet(defaultMermaidConfig, path);
  });

  if (
    unsafePaths.length > 0 &&
    confirm(
      `Removing ${unsafePaths
        .map((unsafePath) => {
          return `${JSON.stringify(unsafePath.join('.'))}: ${JSON.stringify(lodashGet(mermaidConfig, unsafePath))}`;
        })
        .join(
          ',\n'
        )} from the config for safety.\nClick Cancel if you trust the source of this Diagram.`
    )
  ) {
    for (const unsafePath of unsafePaths) {
      const pathToObject = [...unsafePath];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We know this exists since it was found in `getUnsafePaths`
      const lastKey = pathToObject.pop()!;
      const lastObject =
        pathToObject.length === 0 ? mermaidConfig : lodashGet(mermaidConfig, pathToObject);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Copied from mermaid code
      delete lastObject[lastKey];
    }
  }
  return formatJSON(mermaidConfig);
};

export const loadState = (data: string): void => {
  console.log(`Loading '${data}'`);
  update((state) => {
    let next: State;
    try {
      next = deserializeState(data);
      next.mermaid = sanitizeConfig(next.mermaid || defaultState.mermaid);
    } catch (error) {
      next = $state.snapshot(state) as State;
      if (data) {
        console.error('Init error', error);
        next.code = urlParseFailedState;
        next.mermaid = defaultState.mermaid;
      }
    }
    applyPartial(state, next);
  });
};

let renderCount = 0;
const applyPartial = (state: State, newState: Partial<State>): void => {
  renderCount++;
  Object.assign(state, newState, { renderCount });
};

export const updateCodeStore = (newState: Partial<State>): void => {
  update((state) => applyPartial(state, newState));
};

export const updateCode = (
  code: string,
  {
    updateDiagram = false,
    resetPanZoom = false
  }: { updateDiagram?: boolean; resetPanZoom?: boolean } = {}
): void => {
  errorDebug();

  update((state) => {
    if (resetPanZoom) {
      state.pan = undefined;
      state.zoom = undefined;
    }
    state.code = code;
    state.updateDiagram = updateDiagram;
  });
};

export const updateConfig = (config: string): void => {
  updateCodeStore({ mermaid: config });
};

export const toggleDarkTheme = (dark: boolean): void => {
  update((state) => {
    const config = JSON.parse(state.mermaid) as MermaidConfig;
    if (!config.theme || ['dark', 'default'].includes(config.theme)) {
      config.theme = dark ? 'dark' : 'default';
    }
    state.mermaid = formatJSON(config);
  });
};

// Replaces the whole input state (e.g. when restoring a history entry),
// dropping keys the next state does not define.
export const replaceInputState = (next: State): void => {
  update((state) => {
    for (const key of Object.keys(state)) {
      if (!(key in next)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- full-replace semantics
        delete (state as unknown as Record<string, unknown>)[key];
      }
    }
    Object.assign(state, next);
  });
};

export const initURLSubscription = (): void => {
  updateHash = debounce((serialized: string) => {
    history.replaceState(undefined, '', `#${serialized}`);
  }, 250);
  updateHash(validatedCurrent.serialized);
};

export const verifyState = (): void => {
  update((state) => applyPartial(state, state.panZoom ? {} : { panZoom: true }));
};
