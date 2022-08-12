import { loadGistData } from './gist';
import { updateCodeStore, defaultState } from '../state';
import type { Loader, State } from '$lib/types';
const loaders: Record<string, Loader> = {
	gist: loadGistData
};

export const loadDataFromUrl = async (): Promise<void> => {
	const searchParams = new URLSearchParams(window.location.search);
	let state: Partial<State> = defaultState;
	let code: string, config: string;
	let loaded = false;
	const codeURL: string = searchParams.get('code');
	const configURL: string = searchParams.get('config');

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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
			updateDiagram: true,
			updateEditor: true
		});
};
