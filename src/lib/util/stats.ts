import { browser } from '$app/environment';
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
		clearTimeout(timeouts[key]);
		timeouts[key] = window.setTimeout(() => {
			void analytics.track(name, data);
		}, 5000);
	}
};
