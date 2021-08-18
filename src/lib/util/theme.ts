import { writable } from 'svelte/store';
import { persist, localStorage } from '@macfja/svelte-persistent-store';

export const themeStore = persist(
	writable({
		isDark: false,
		theme: ''
	}),
	localStorage(),
	'themeStore'
);

const darkThemes = ['dark', 'synthwave', 'halloween', 'forest', 'luxury', 'black', 'dracula'];

export const setTheme = (theme: string): void => {
	if (theme.includes(' ')) {
		theme = theme.split(' ')[1].trim();
	}
	const isDark = darkThemes.includes(theme);
	console.log('Setting theme', theme);
	themeStore.set({ theme, isDark });
};
