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

export const saveStatistics = (graph: string): void => {
	const graphType = detectType(graph);
	console.debug(`ga: send event: render ${graphType}`);
	logEvent('render', { graphType });
};

// manual debounce to only send analytics event every 5 seconds if same event is repeated frequently.
const timeouts: Record<string, number> = {};
export const logEvent = (name: string, data?: unknown): void => {
	if (analytics) {
		const key = data ? JSON.stringify({ name, data }) : name;
		clearInterval(timeouts[key]);
		timeouts[key] = window.setTimeout(() => {
			void analytics.track(name, data);
		}, 5000);
	}
};
