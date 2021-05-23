import type { State } from '$lib/types';
import { initURLSubscription, loadState, updateCodeStore } from './state';
import { analytics, initAnalytics } from './stats';

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
	syncDiagram();
	initURLSubscription();
	await initAnalytics();
	analytics?.page();
};
