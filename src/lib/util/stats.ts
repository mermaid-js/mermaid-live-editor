import { browser } from '$app/env';
import type { AnalyticsInstance } from 'analytics';

export let analytics: AnalyticsInstance;

export const initAnalytics = async (): Promise<void> => {
	if (browser && !analytics) {
		try {
			const [{ Analytics }, { default: plausible }] = await Promise.all([
				import('analytics'),
				import('analytics-plugin-plausible')
			]);
			analytics = Analytics({
				app: 'mermaid-live-editor',
				plugins: [
					plausible({
						domain: 'mermaid.live',
						hashMode: false,
						trackLocalhost: false, // By default 'false'
						apiHost: 'https://plausible.io'
					})
				]
			});
		} catch (e) {
			console.log(e);
			console.info('Analytics blocked ;)');
		}
	}
};

const detectType = (text: string): string => {
	return text
		.replace(/^\s*%%.*\n/g, '\n')
		.trimStart()
		.split(' ')[0];
};

// manual debounce
let timeout: number;
export const saveStatistics = (graph: string): void => {
	if (analytics) {
		clearTimeout(timeout);
		// Only save statistics after a 5 sec delay
		timeout = window.setTimeout(() => {
			const graphType = detectType(graph);
			console.debug(`ga: send event: render ${graphType}`);
			void logEvent('render', { graphType });
		}, 5000);
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logEvent = async (name: string, data?: any): Promise<void> => {
	await analytics?.track(name, data);
};
