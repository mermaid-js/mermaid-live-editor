import { initURLSubscription, loadState, updateCodeStore } from './state';

export const loadStateFromURL = (): void => {
	loadState(window.location.hash.slice(1));
};

export const syncDiagram = (): void => {
	updateCodeStore({
		updateDiagram: true
	} as State);
};

export const initHandler = (): void => {
	loadStateFromURL();
	syncDiagram();
	initURLSubscription();
};
