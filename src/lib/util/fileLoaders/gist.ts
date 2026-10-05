import { defaultState } from '$/constants';
import type { HistoryEntry, Optional, State } from '$lib/types';

const codeFileName = 'code.mmd';
const configFileName = 'config.json';

type FetchText = (url: string) => Promise<string>;

interface GithubFile {
  truncated: boolean;
  raw_url: string;
  content: string;
}

interface GistData {
  code: string;
  config?: string;
  author: string;
  time: number;
  version: string;
  url: string;
}

interface GistResponse {
  files: Record<string, GithubFile>;
  html_url: string;
  history: { url: string; committed_at: string; version: string; user: { login: string } }[];
}

// Accepts gist page URLs (gist.github.com/<user>/<id>[/<revision>]) as well as
// the API URLs listed in a gist's history (api.github.com/gists/<id>/<revision>).
const fetchGist = async (gistURL: string, fetchText: FetchText): Promise<GistResponse> => {
  const path = gistURL.split('github.com').pop();
  if (!path) {
    throw new Error('Invalid GitHub URL' + gistURL);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, __, gistID, revisionID] = path.split('/');
  return JSON.parse(
    await fetchText(`https://api.github.com/gists/${gistID}${revisionID ? '/' + revisionID : ''}`)
  ) as GistResponse;
};

const getFileContent = async (file: GithubFile, fetchText: FetchText): Promise<string> => {
  if (file.truncated) {
    return await fetchText(file.raw_url);
  }
  return file.content;
};

const getGistData = async (gistURL: string, fetchText: FetchText): Promise<GistData> => {
  const { html_url, files, history } = await fetchGist(gistURL, fetchText);
  if (!(codeFileName in files)) {
    throw new Error('Invalid gist provided');
  }
  const code = await getFileContent(files[codeFileName], fetchText);
  let config = '{}';
  if (configFileName in files) {
    config = await getFileContent(files[configFileName], fetchText);
  }
  const currentItem = history[0];
  return {
    author: currentItem.user.login,
    code,
    config,
    time: new Date(currentItem.committed_at).getTime(),

    url: `${html_url}/${currentItem.version}`,
    version: currentItem.version.slice(-7)
  };
};

const getStateFromGist = (gist: GistData, gistURL: string = gist.url): State => {
  const state: State = {
    ...defaultState,
    code: gist.code,
    loader: {
      config: {
        url: gistURL
      },
      type: 'gist'
    }
  };
  if (gist.config) {
    state.mermaid = gist.config;
  }
  return state;
};

/**
 * Loads a gist (or one of its revisions) along with every earlier revision.
 * Configs are returned as found; callers sanitize them.
 *
 * @returns The state of the requested revision, and all revisions newest first.
 */
export const loadGist = async (
  gistURL: string,
  fetchText: FetchText
): Promise<{ state: State; revisions: Optional<HistoryEntry, 'id'>[] }> => {
  const { history } = await fetchGist(gistURL, fetchText);
  const gistHistory: GistData[] = [];
  for (const entry of history) {
    try {
      gistHistory.push(await getGistData(entry.url, fetchText));
    } catch (error) {
      console.error(error);
    }
  }
  const latest = gistHistory[0];
  if (!latest) {
    throw new Error('Invalid gist provided');
  }
  return {
    revisions: gistHistory.map((gist) => ({
      name: `${gist.author} v${gist.version}`,
      state: getStateFromGist(gist),
      time: gist.time,
      type: 'loader' as const,
      url: gist.url
    })),
    state: getStateFromGist(latest, gistURL)
  };
};
