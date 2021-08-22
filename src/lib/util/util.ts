import type { State } from '$lib/types';
import { initURLSubscription, loadState, updateCodeStore } from './state';
import { analytics, initAnalytics } from './stats';
import { loadDataFromUrl } from './fileLoaders/loader';
import { initLoading } from './loading';

export const loadStateFromURL = (): void => {
	loadState(window.location.hash.slice(1));
};

export const syncDiagram = (): void => {
	updateCodeStore({
		updateDiagram: true
	} as State);
};

export const initHandler = async (): Promise<void> => {
	loadStateFromURL();
	await initLoading('Loading Gist...', loadDataFromUrl().catch(console.error));
	syncDiagram();
	initURLSubscription();
	await initAnalytics();
	analytics?.page();
};
