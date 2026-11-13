/**
 * Turns diagrams arriving from outside the app (the URL hash, `?code=` /
 * `?config=` files, `?gist=` and uploaded History files) into states that
 * are safe to apply. Every source goes through the same sanitize policy here;
 * callers only apply the result.
 */
import { defaultState } from '#lib/constants.js';
import type { HistoryEntry, State } from '#lib/types.js';
import { hasUnsafeConfig, sanitizeConfig, stripUnsafeConfig, type Confirm } from '../sanitize';
import { deserializeState } from '../serde';
import { loadGist, type FetchText } from './gist';

export interface IngestAdapters {
  /** Asks the user whether to strip unsafe config; true strips it. */
  confirm: Confirm;
  fetchText: FetchText;
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
 * Decodes a serialized state from the URL hash (a leading `#` is ignored).
 *
 * @returns The sanitized state, the troubleshooting diagram if the hash
 * cannot be decoded, or undefined for an empty hash.
 */
export const ingestHash = (
  hash: string,
  { confirm }: Pick<IngestAdapters, 'confirm'>
): Partial<State> | undefined => {
  const serialized = hash.replace(/^#/, '');
  if (!serialized) {
    return undefined;
  }
  try {
    const state = deserializeState(serialized);
    state.mermaid = sanitizeConfig(state.mermaid, confirm);
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
  const config = configURL && (await fetchText(configURL));
  return {
    code,
    loader: { config: { codeURL, configURL }, type: 'files' },
    mermaid: sanitizeConfig(config, confirm)
  };
};

const ingestGist = async (gistURL: string, { confirm, fetchText }: IngestAdapters) => {
  const { state, revisions } = await loadGist(gistURL, fetchText);
  state.mermaid = sanitizeConfig(state.mermaid, confirm);
  // Revisions are only applied when picked from History later, so a prompt
  // per revision would be noise: strip their unsafe settings silently.
  for (const revision of revisions) {
    revision.state.mermaid = stripUnsafeConfig(revision.state.mermaid);
  }
  return { revisions, state };
};

/**
 * Resolves the state the app should start from, given the page location.
 * `?code=` (with optional `?config=`) wins over `?gist=`, which wins over the
 * hash; a query source that fails to load falls back to the hash. Only the
 * winning source is sanitized, so the user is asked at most once.
 *
 * @returns The state to apply (undefined keeps the stored one) and earlier
 * revisions of the loaded source (e.g. a gist), newest first.
 */
export const ingestLocation = async (
  { hash, search }: { hash: string; search: string },
  adapters: IngestAdapters
) => {
  const params = new URLSearchParams(search);
  const codeURL = params.get('code');
  const gistURL = params.get('gist');
  if (codeURL) {
    try {
      const state = await ingestFiles(codeURL, params.get('config') ?? undefined, adapters);
      if (state) {
        return { revisions: [], state };
      }
    } catch (error) {
      console.error(error);
    }
  }
  if (gistURL) {
    try {
      return await ingestGist(gistURL, adapters);
    } catch (error) {
      console.error(error);
    }
  }
  return { revisions: [], state: ingestHash(hash, adapters) };
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
  const unsafe = new Set(
    entries.filter((entry) => entry?.state && hasUnsafeConfig(entry.state.mermaid))
  );
  if (
    unsafe.size === 0 ||
    !confirm(
      `Removing unsafe settings from ${unsafe.size} of ${entries.length} history entries for safety.\nClick Cancel if you trust the source of these Diagrams.`
    )
  ) {
    return entries;
  }
  return entries.map((entry) =>
    unsafe.has(entry)
      ? { ...entry, state: { ...entry.state, mermaid: stripUnsafeConfig(entry.state.mermaid) } }
      : entry
  );
};
