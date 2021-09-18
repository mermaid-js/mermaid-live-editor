import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { persist, localStorage } from '@macfja/svelte-persistent-store';

export interface ThemeConfig {
	isDark: boolean;
	theme?: string;
}

export const themeStore: Writable<ThemeConfig> = persist(
	writable({
		isDark: false
	}),
	localStorage(),
	'themeStore'
);

const darkThemes = [
	'dark',
	'synthwave',
	'halloween',
	'aqua',
	'forest',
	'luxury',
	'black',
	'dracula'
];

export const setTheme = (theme: string): void => {
	if (theme.includes(' ')) {
		theme = theme.split(' ')[1].trim();
	}
	const isDark = darkThemes.includes(theme);
	console.log('Setting theme', theme);
	themeStore.set({ theme, isDark });
};
