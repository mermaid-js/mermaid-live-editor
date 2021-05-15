import { derived, Readable, Writable, writable } from 'svelte/store';

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
