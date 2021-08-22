import { derived, writable, get } from 'svelte/store';
import type { Readable, Writable } from 'svelte/store';
import { persist, localStorage } from '@macfja/svelte-persistent-store';
import { generateSlug } from 'random-word-slugs';
import type { HistoryEntry, HistoryType } from '$lib/types';

const MAX_AUTO_HISTORY_LENGTH = 30;

export const historyModeStore: Writable<HistoryType> = persist(
	writable('manual'),
	localStorage(),
	'autoHistoryMode'
);

const autoHistoryStore: Writable<HistoryEntry[]> = persist(
	writable([]),
	localStorage(),
	'autoHistoryStore'
);

const manualHistoryStore: Writable<HistoryEntry[]> = persist(
	writable([]),
	localStorage(),
	'manualHistoryStore'
);

export const loaderHistoryStore: Writable<HistoryEntry[]> = writable([] as HistoryEntry[]);

export const historyStore: Readable<HistoryEntry[]> = derived(
	[historyModeStore, autoHistoryStore, manualHistoryStore, loaderHistoryStore],
	([historyMode, autoHistories, manualHistories, loadedHistories], set) => {
		if (historyMode === 'auto') {
			set(autoHistories);
		} else if (historyMode === 'manual') {
			set(manualHistories);
		} else if (historyMode === 'loader') {
			set(loadedHistories);
		} else {
			set(autoHistories);
		}
	}
);

export const addHistoryEntry = (entry: HistoryEntry): void => {
	if (entry.type === 'loader') {
		loaderHistoryStore.update((entries) => [entry, ...entries]);
		return;
	}
	entry.name = generateSlug(2);
	if (entry.type !== 'auto') {
		manualHistoryStore.update((entries) => [entry, ...entries]);
		return;
	}
	autoHistoryStore.update((entries) => {
		if (entries.length === MAX_AUTO_HISTORY_LENGTH) {
			entries.pop();
		}
		return [entry, ...entries];
	});
};

export const clearHistoryData = (time?: number): void => {
	(get(historyModeStore) === 'auto' ? autoHistoryStore : manualHistoryStore).update((entries) => {
		if (get(historyModeStore) !== 'loader') {
			entries = entries.filter((entry) => time && entry.time != time);
		}
		return entries;
	});
};

export const getPreviousState = (auto: boolean): string => {
	const entries = get(auto ? autoHistoryStore : manualHistoryStore);
	if (entries.length > 0) {
		return JSON.stringify(entries[0].state);
	}
	return '';
};
