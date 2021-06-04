import { getGistData } from './gist';
import { updateCode, updateConfig } from '../state';
import type { Loader } from '$lib/types';
const loaders: Record<string, Loader> = {
	gist: getGistData
};

export const loadDataFromUrl = async (): Promise<void> => {
	const searchParams = new URLSearchParams(window.location.search);
	let code: string, config: string;
	if (searchParams.has('code')) {
		code = await (await fetch(searchParams.get('code'))).text();
	}
	if (searchParams.has('config')) {
		config = await (await fetch(searchParams.get('config'))).text();
	}

	if (!code) {
		for (const [key, value] of searchParams.entries()) {
			if (key in loaders) {
				({ code, config } = await loaders[key](value));
				break;
			}
		}
	}
	code && updateCode(code, true, true);
	config && updateConfig(config, true);
};
