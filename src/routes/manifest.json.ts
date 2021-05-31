import { base } from '$app/paths';
export const get = (): { body: any } => {
	return {
		body: {
			short_name: 'Mermaid',
			name: 'Mermaid Live Editor',
			icons: [
				{
					src: `${base}/icon-192.png`,
					type: 'image/png',
					sizes: '192x192'
				},
				{
					src: `${base}/icon-512.png`,
					type: 'image/png',
					sizes: '512x512'
				}
			],
			start_url: `${base}/edit`,
			background_color: '#3367D6',
			display: 'standalone',
			scope: `${base}`,
			theme_color: '#3367D6',
			description: 'Description'
		}
	};
};
