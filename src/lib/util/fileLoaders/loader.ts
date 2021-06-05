import { loadGistData } from './gist';
import { updateCodeStore, defaultState } from '../state';
import type { Loader, State } from '$lib/types';
const loaders: Record<string, Loader> = {
	gist: loadGistData
};

export const loadDataFromUrl = async (): Promise<void> => {
	const searchParams = new URLSearchParams(window.location.search);
	let state: State = defaultState;
	let code: string, config: string;
	const codeURL: string = searchParams.get('code');
	const configURL: string = searchParams.get('config');

	if (codeURL) {
		code = await (await fetch(codeURL)).text();
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
					break;
				} catch (err) {
					console.error(err);
				}
			}
		}
	} else {
		state = {
			code,
			mermaid: config,
			autoSync: true,
			updateDiagram: true,
			updateEditor: true,
			loader: {
				type: 'files',
				config: {
					codeURL,
					configURL
				}
			}
		};
	}
	updateCodeStore(state);
	// window.location.search = '';
};
