import { derived, Readable, Writable, writable, get } from 'svelte/store';

const MAX_AUTO_HISTORY_LENGTH = 10;

export const autoHistoryMode: Writable<boolean> = writable(true);
const autoHistoryStore: Writable<HistoryEntry[]> = writable([]);
const manualHistoryStore: Writable<HistoryEntry[]> = writable([]);
export const historyStore: Readable<HistoryEntry[]> = derived(
	[autoHistoryMode, autoHistoryStore, manualHistoryStore],
	([autoMode, autoHistories, manualHistories], set) => {
		set(autoMode ? autoHistories : manualHistories);
	}
);
export const addHistoryEntry = (entry: HistoryEntry): void => {
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

export const clearHistoryData = (time?: Date): void => {
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
