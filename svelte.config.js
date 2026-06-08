import adapter from '@sveltejs/adapter-static';
import 'dotenv/config';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [sveltePreprocess({})],
  kit: {
    alias: {
      '$/*': './src/lib/*'
    },
    paths: {
      base: process.env.MERMAID_BASE_PATH ?? ''
    },
    adapter: adapter({
      pages: 'docs',
      fallback: '404.html'
    })
  }
};

export default config;
