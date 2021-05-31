import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true
		})
	],

	kit: {
		adapter: adapter({
			pages: 'docs',
			fallback: 'index.html'
		}),
		paths: {
			base: '/mermaid-live-editor'
		},
		ssr: false,
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		trailingSlash: 'ignore'
	}
};

export default config;
