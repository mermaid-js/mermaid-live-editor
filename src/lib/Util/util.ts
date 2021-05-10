import { loadState } from './state';

export const loadStateFromURL = (): void => {
	loadState(window.location.hash.slice(1));
};
