import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [sveltePreprocess({})],
  kit: {
    paths: {
      base: process.env.BASE_PATH || ''
    },
    alias: {
      '$/*': './src/lib/*'
    },
    adapter: adapter({
      pages: 'docs',
      fallback: '404.html'
    })
  }
};

export default config;
