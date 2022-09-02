import { browser } from '$app/environment';
import type { AnalyticsInstance } from 'analytics';

export let analytics: AnalyticsInstance;

export const initAnalytics = async (): Promise<void> => {
	if (browser && !analytics) {
		try {
			const { Analytics } = await import('analytics');
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const googleAnalytics = (await import('@analytics/google-analytics')).default;
			const plausible = (await import('analytics-plugin-plausible')).default;
			analytics = Analytics({
				app: 'mermaid-live-editor',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				plugins: [
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
					googleAnalytics({
						measurementIds: ['UA-153180559-1']
					}),
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
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
