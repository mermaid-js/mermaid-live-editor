import { Writable, writable } from 'svelte/store';

export const historyStore: Writable<HistoryEntry[]> = writable([]);
