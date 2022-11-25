import { loadGistData } from './gist';
import { updateCodeStore, defaultState } from '$lib/util/state';
import { fetchText } from '$lib/util/util';
import type { Loader, State } from '$lib/types';

const loaders: Record<string, Loader> = {
  gist: loadGistData
};

export const loadDataFromUrl = async (): Promise<void> => {
  const searchParams = new URLSearchParams(window.location.search);
  let state: Partial<State> = defaultState;
  let loaded = false;
  const codeURL: string | undefined = searchParams.get('code') ?? undefined;
  const configURL: string | undefined = searchParams.get('config') ?? undefined;

  let code: string | undefined;
  const config = configURL ? await fetchText(configURL) : defaultState.mermaid;

  if (codeURL) {
    code = await fetchText(codeURL);
    loaded = true;
  }
  if (code) {
    if (!codeURL) {
      throw new Error('Code URL is not defined');
    }
    state = {
      code,
      mermaid: config,
      loader: {
        type: 'files',
        config: {
          codeURL,
          configURL
        }
      }
    };
  } else {
    for (const [key, value] of searchParams.entries()) {
      if (key in loaders) {
        try {
          state = await loaders[key](value);
          loaded = true;
          break;
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
  loaded &&
    updateCodeStore({
      ...state,
      autoSync: true,
      updateDiagram: true
    });
};
