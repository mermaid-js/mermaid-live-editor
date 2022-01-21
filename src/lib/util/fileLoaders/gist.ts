/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { State } from '$lib/types';
import { defaultState } from '../state';
import { addHistoryEntry } from '../../components/history/history';

export interface GistResponse {
	url: string;
	forks_url: string;
	commits_url: string;
	id: string;
	node_id: string;
	git_pull_url: string;
	git_push_url: string;
	html_url: string;
	files: Files;
	public: boolean;
	created_at: string;
	updated_at: string;
	description: string;
	comments: number;
	user: any;
	comments_url: string;
	owner: Owner;
	fork_of: any;
	forks: any[];
	history: History[];
	truncated: boolean;
}

export interface Files {
	[key: string]: File;
}

export interface File {
	filename: string;
	type: string;
	language: any;
	raw_url: string;
	size: number;
	truncated: boolean;
	content: string;
}

export interface Owner {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
}

export interface History {
	user: User;
	version: string;
	committed_at: string;
	change_status: ChangeStatus;
	url: string;
}

export interface User {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
}

export interface ChangeStatus {
	total: number;
	additions: number;
	deletions: number;
}

const codeFileName = 'code.mmd';
const configFileName = 'config.json';

const isValidGist = (files: Files): boolean => {
	return codeFileName in files;
};

const getFileContent = async (file: File): Promise<string> => {
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
	const { html_url, files, history } = (await (
		await fetch(`https://api.github.com/gists/${gistID}${revisionID ? '/' + revisionID : ''}`)
	).json()) as GistResponse;
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
			version: currentItem.version.slice(-7)
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
