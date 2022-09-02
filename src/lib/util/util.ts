import { initURLSubscription, loadState, updateCodeStore } from './state';
import { analytics, initAnalytics } from './stats';
import { loadDataFromUrl } from './fileLoaders/loader';
import { initLoading } from './loading';
import { applyMigrations } from './migrations';

export const loadStateFromURL = (): void => {
	loadState(window.location.hash.slice(1));
};

export const syncDiagram = (): void => {
	updateCodeStore({
		updateDiagram: true
	});
};

export const initHandler = async (): Promise<void> => {
	applyMigrations();
	loadStateFromURL();
	await initLoading('Loading Gist...', loadDataFromUrl().catch(console.error));
	syncDiagram();
	initURLSubscription();
	await initAnalytics();
	analytics?.page();
};

export const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
export const cmdKey = isMac ? 'Cmd' : 'Ctrl';
