import { browser } from '$app/env';
import type { AnalyticsInstance } from 'analytics';

export let analytics: AnalyticsInstance;

export const initAnalytics = async (): Promise<void> => {
	if (browser && !analytics) {
		try {
			const { Analytics } = await import('analytics');
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const googleAnalytics = await import('@analytics/google-analytics');
			analytics = Analytics({
				app: 'mermaid-live-editor',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				plugins: [
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
					googleAnalytics.init({
						trackingId: 'UA-153180559-1'
					})
				]
			});
		} catch {
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
let timeout;
export const saveStatistcs = (graph: string): void => {
	if (analytics) {
		clearTimeout(timeout);
		// Only save statistcs after a 5 sec delay
		timeout = setTimeout(function () {
			const graphType = detectType(graph);
			console.debug('ga:', 'send', 'event', 'render', graphType);
			void analytics.track('render', {
				graphType
			});
		}, 5000);
	}
};
