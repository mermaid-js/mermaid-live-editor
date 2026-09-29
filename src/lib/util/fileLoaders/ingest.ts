/**
 * Turns diagrams arriving from outside the app (the URL hash, `?code=` /
 * `?config=` files, `?gist=` and uploaded History files) into states that
 * are safe to apply. Every source goes through the same sanitize policy here;
 * callers only apply the result.
 */
import { defaultState } from '$/constants';
import type { HistoryEntry, State } from '$/types';
import { sanitizeConfig, sanitizeConfigs, silentlySanitizeConfig, type Confirm } from '../sanitize';
import { deserializeState } from '../serde';
import { loadGist, type GistRevision } from './gist';

export interface IngestAdapters {
  /** Asks the user whether to strip unsafe config; true strips it. */
  confirm: Confirm;
  fetchText: (url: string) => Promise<string>;
}

export interface Ingested {
  /** The state to apply, or undefined to keep the stored one. */
  state?: Partial<State>;
  /** Earlier revisions of the loaded source (e.g. a gist), newest first. */
  revisions: GistRevision[];
}

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

/**
 * Decodes a serialized state from the URL hash (without the leading `#`).
 *
 * @returns The sanitized state, the troubleshooting diagram if the hash
 * cannot be decoded, or undefined for an empty hash.
 */
export const ingestHash = (hash: string, { confirm }: Pick<IngestAdapters, 'confirm'>) => {
  if (!hash) {
    return undefined;
  }
  console.log(`Loading '${hash}'`);
  try {
    const state = deserializeState(hash);
    state.mermaid = sanitizeConfig(state.mermaid || defaultState.mermaid, confirm);
    return state;
  } catch (error) {
    console.error('Init error', error);
    return { code: urlParseFailedState, mermaid: defaultState.mermaid };
  }
};

const ingestFiles = async (
  codeURL: string,
  configURL: string | undefined,
  { confirm, fetchText }: IngestAdapters
): Promise<Partial<State> | undefined> => {
  const code = await fetchText(codeURL);
  if (!code) {
    return undefined;
  }
  const config = configURL ? await fetchText(configURL) : defaultState.mermaid;
  return {
    code,
    loader: { config: { codeURL, configURL }, type: 'files' },
    mermaid: sanitizeConfig(config || defaultState.mermaid, confirm)
  };
};

const ingestGist = async (gistURL: string, { confirm, fetchText }: IngestAdapters) => {
  const { state, revisions } = await loadGist(gistURL, fetchText);
  state.mermaid = sanitizeConfig(state.mermaid || defaultState.mermaid, confirm);
  // Revisions are only applied when picked from History later, so a prompt
  // per revision would be noise: strip their unsafe settings silently.
  for (const revision of revisions) {
    revision.state.mermaid = JSON.stringify(
      silentlySanitizeConfig(revision.state.mermaid),
      undefined,
      2
    );
  }
  return { revisions, state };
};

/**
 * Resolves the state the app should start from, given the page location.
 * `?code=` (with optional `?config=`) wins over `?gist=`, which wins over the
 * hash; a query source that fails to load falls back to the hash. Only the
 * winning source is sanitized, so the user is asked at most once.
 */
export const ingestLocation = async (
  { hash, search }: { hash: string; search: string },
  adapters: IngestAdapters
): Promise<Ingested> => {
  const params = new URLSearchParams(search);
  const codeURL = params.get('code');
  const gistURL = params.get('gist');
  try {
    if (codeURL) {
      const state = await ingestFiles(codeURL, params.get('config') ?? undefined, adapters);
      if (state) {
        return { revisions: [], state };
      }
    } else if (gistURL) {
      return await ingestGist(gistURL, adapters);
    }
  } catch (error) {
    console.error(error);
  }
  return { revisions: [], state: ingestHash(hash.replace(/^#/, ''), adapters) };
};

/**
 * Parses an uploaded History file and sanitizes every entry's config behind a
 * single confirmation.
 *
 * @throws If the file is not JSON or not a list of entries.
 */
export const ingestHistoryFile = (
  text: string,
  { confirm }: Pick<IngestAdapters, 'confirm'>
): HistoryEntry[] => {
  const data: unknown = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new TypeError('History file must contain a list of entries');
  }
  const entries = data as HistoryEntry[];
  const configs = sanitizeConfigs(
    entries.map((entry) => entry?.state?.mermaid ?? defaultState.mermaid),
    confirm
  );
  return entries.map((entry, index) =>
    entry?.state ? { ...entry, state: { ...entry.state, mermaid: configs[index] } } : entry
  );
};
