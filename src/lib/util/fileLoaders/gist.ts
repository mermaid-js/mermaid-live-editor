/* eslint-disable @typescript-eslint/no-explicit-any */
import { addHistoryEntry } from '$lib/components/History/history';
import type { State } from '$lib/types';
import { defaultState } from '$lib/util/state';
import { fetchJSON, fetchText } from '$lib/util/util';

const codeFileName = 'code.mmd';
const configFileName = 'config.json';

interface GithubFile {
  truncated: boolean;
  raw_url: string;
  content: string;
}

const isValidGist = (files: any): boolean => {
  return codeFileName in files;
};

const getFileContent = async (file: GithubFile): Promise<string> => {
  if (file.truncated) {
    return await fetchText(file.raw_url);
  }
  return file.content;
};

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

const getGistData = async (gistURL: string): Promise<GistData> => {
  const path = gistURL.split('github.com').pop();
  if (!path) {
    throw new Error('Invalid GitHub URL' + gistURL);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, __, gistID, revisionID] = path.split('/');

  const { html_url, files, history }: GistResponse = await fetchJSON(
    `https://api.github.com/gists/${gistID}${revisionID ? '/' + revisionID : ''}`
  );
  if (isValidGist(files)) {
    const code = await getFileContent(files[codeFileName]);
    let config = '{}';
    if (configFileName in files) {
      config = await getFileContent(files[configFileName]);
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
  } else {
    throw new Error('Invalid gist provided');
  }
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

export const loadGistData = async (gistURL: string): Promise<State> => {
  const path = gistURL.split('github.com').pop();
  if (!path) {
    throw new Error('Invalid GitHub URL' + gistURL);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, __, gistID, revisionID] = path.split('/');

  const { history }: GistResponse = await fetchJSON(
    `https://api.github.com/gists/${gistID}${revisionID ? '/' + revisionID : ''}`
  );
  const gistHistory: GistData[] = [];
  for (const entry of history) {
    try {
      const data: GistData = await getGistData(entry.url);
      gistHistory.push(data);
    } catch (error) {
      console.error(error);
    }
  }
  if (gistHistory.length === 0) {
    throw new Error('Invalid gist provided');
  }
  gistHistory.reverse();
  const entry = gistHistory.at(-1);
  if (!entry) {
    throw new Error('Invalid gist provided');
  }
  const state = getStateFromGist(entry, gistURL);
  for (const gist of gistHistory) {
    addHistoryEntry({
      name: `${gist.author} v${gist.version}`,
      state: getStateFromGist(gist),
      time: gist.time,
      type: 'loader',
      url: gist.url
    });
  }
  return state;
};
