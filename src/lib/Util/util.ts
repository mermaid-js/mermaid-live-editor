import { loadState } from './state';

export const loadStateFromURL = (): void => {
	debugger;
	loadState(window.location.hash);
};
