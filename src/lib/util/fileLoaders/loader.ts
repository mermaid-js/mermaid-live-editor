import { loadGistData } from './gist';
import { updateCodeStore, defaultState } from '../state';
import type { Loader, State } from '$lib/types';
const loaders: Record<string, Loader> = {
  gist: loadGistData
};

export const loadDataFromUrl = async (): Promise<void> => {
  const searchParams = new URLSearchParams(window.location.search);
  let state: Partial<State> = defaultState;
  let code: string | undefined = undefined;
  let config: string | undefined = undefined;
  let loaded = false;
  const codeURL: string | undefined = searchParams.get('code') ?? undefined;
  const configURL: string | undefined = searchParams.get('config') ?? undefined;

  if (codeURL) {
    code = await (await fetch(codeURL)).text();
    loaded = true;
  }
  if (configURL) {
    config = await (await fetch(configURL)).text();
  } else {
    config = defaultState.mermaid;
  }
  if (!code) {
    for (const [key, value] of searchParams.entries()) {
      if (key in loaders) {
        try {
          state = await loaders[key](value);
          loaded = true;
          break;
        } catch (err) {
          console.error(err);
        }
      }
    }
  } else {
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
  }
  loaded &&
    updateCodeStore({
      ...state,
      autoSync: true,
      updateDiagram: true
    });
};
