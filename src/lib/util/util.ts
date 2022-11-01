import { initURLSubscription, loadState, updateCodeStore } from './state';
import { analytics, initAnalytics } from './stats';
import { loadDataFromUrl } from './fileLoaders/loader';
import { initLoading } from './loading';
import { applyMigrations } from './migrations';
import { init } from './mermaid';

export const loadStateFromURL = (): void => {
	loadState(window.location.hash.slice(1));
};

export const syncDiagram = (): void => {
	updateCodeStore({
		updateDiagram: true
	});
};

export const initHandler = async (): Promise<void> => {
	applyMigrations();
	await initLoading('Loading Mermaid...', init());
	loadStateFromURL();
	await initLoading('Loading Gist...', loadDataFromUrl().catch(console.error));
	syncDiagram();
	initURLSubscription();
	await initAnalytics();
	analytics?.page();
};

export const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
export const cmdKey = isMac ? 'Cmd' : 'Ctrl';

let count = 0;
export const errorDebug = (limit = 100) => {
	count += 1;
	if (count > limit) {
		console.log(count, limit);
		// eslint-disable-next-line no-debugger
		debugger;
	}
};

// To queue async tasks so they are executed one after the other, not concurrently.
export class AsyncQueue<T> {
	private readonly queue: T[] = [];
	private running = false;
	constructor(private processor: (item: T) => Promise<void>) {}
	public async process(item: T): Promise<void> {
		this.queue.push(item);
		if (this.running) {
			return;
		}
		this.running = true;
		while (this.queue.length > 0) {
			const item = this.queue.shift();
			if (item) {
				await this.processor(item);
			}
		}
		this.running = false;
	}
}
