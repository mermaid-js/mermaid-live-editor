import { derived, Readable, Writable, writable, get } from 'svelte/store';
import { persist, localStorage } from '@macfja/svelte-persistent-store';
import { generateSlug } from 'random-word-slugs';
import type { HistoryEntry } from '../../types';

const MAX_AUTO_HISTORY_LENGTH = 30;

export const autoHistoryMode: Writable<boolean> = persist(
	writable(true),
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

export const historyStore: Readable<HistoryEntry[]> = derived(
	[autoHistoryMode, autoHistoryStore, manualHistoryStore],
	([autoMode, autoHistories, manualHistories], set) => {
		set(autoMode ? autoHistories : manualHistories);
	}
);

export const addHistoryEntry = (entry: HistoryEntry): void => {
	entry.name = generateSlug(2);

	if (!entry.auto) {
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
	(get(autoHistoryMode) ? autoHistoryStore : manualHistoryStore).update((entries) =>
		entries.filter((entry) => time && entry.time != time)
	);
};

export const getPreviousState = (auto: boolean): string => {
	const entries = get(auto ? autoHistoryStore : manualHistoryStore);
	if (entries.length > 0) {
		return JSON.stringify(entries[0].state);
	}
	return '';
};
