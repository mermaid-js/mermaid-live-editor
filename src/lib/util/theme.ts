import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { persist, localStorage } from '$lib/util/persist';
import { logEvent } from './stats';

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

const darkThemes = new Set([
  'dark',
  'synthwave',
  'halloween',
  'aqua',
  'forest',
  'luxury',
  'black',
  'dracula'
]);

export const setTheme = (theme: string): void => {
  if (theme.includes(' ')) {
    theme = theme.split(' ')[1].trim();
  }
  const isDark = darkThemes.has(theme);
  console.log('Setting theme', theme);
  themeStore.set({ theme, isDark });
  logEvent('themeChange', { theme, isDark });
};
