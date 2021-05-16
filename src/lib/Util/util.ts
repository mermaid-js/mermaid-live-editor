import { initURLSubscription, loadState } from './state';

export const loadStateFromURL = (): void => {
	loadState(window.location.hash.slice(1));
};

export const initHandler = (): void => {
	loadStateFromURL();
	initURLSubscription();
};
