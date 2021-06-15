/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { State } from '$lib/types';
import { defaultState } from '../state';
import { addHistoryEntry } from '../../components/history/history';

const codeFileName = 'code.mmd';
const configFileName = 'config.json';

const isValidGist = (files: any): boolean => {
	return codeFileName in files;
};

const getFileContent = async (file: any): Promise<string> => {
	if (file.truncated) {
		return await (await fetch(file.raw_url)).text();
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

const getGistData = async (gistURL: string): Promise<GistData> => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, __, gistID, revisionID] = gistURL.split('github.com').pop().split('/');
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const { html_url, files, history } = await (
		await fetch(`https://api.github.com/gists/${gistID}${revisionID ? '/' + revisionID : ''}`)
	).json();
	if (isValidGist(files)) {
		const code = await getFileContent(files[codeFileName]);
		let config: string;
		if (configFileName in files) {
			config = await getFileContent(files[configFileName]);
		}
		const currentItem = history[0];
		return {
			url: `${html_url}/${currentItem.version}`,
			code,
			config,
			author: currentItem.user.login,
			time: new Date(currentItem.committed_at).getTime(),
			version: (currentItem.version as string).slice(-7)
		};
	} else {
		throw 'Invalid gist provided';
	}
};

const getStateFromGist = (gist: GistData, gistURL: string = gist.url): State => {
	const state: State = {
		...defaultState,
		code: gist.code,
		loader: {
			type: 'gist',
			config: {
				url: gistURL
			}
		}
	};
	gist.config && (state.mermaid = gist.config);
	return state;
};

export const loadGistData = async (gistURL: string): Promise<State> => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_, __, gistID, revisionID] = gistURL.split('github.com').pop().split('/');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const { history } = await (
			await fetch(`https://api.github.com/gists/${gistID}${revisionID ? '/' + revisionID : ''}`)
		).json();
		const gistHistory: GistData[] = [];
		for (const entry of history) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const data: GistData = await getGistData(entry.url).catch(() => undefined);
			data && gistHistory.push(data);
		}
		if (gistHistory.length === 0) {
			throw 'Invalid gist provided';
		}
		gistHistory.reverse();
		const state = getStateFromGist(gistHistory.slice(-1).pop(), gistURL);
		for (const gist of gistHistory) {
			addHistoryEntry({
				state: getStateFromGist(gist),
				time: gist.time,
				type: 'loader',
				url: gist.url,
				name: `${gist.author} v${gist.version}`
			});
		}
		return state;
	} catch (err) {
		console.error(err);
	}
};
