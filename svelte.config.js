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
      pages: `docs`
    }),
    paths: process.env['DEPLOY']
      ? {
          base: `/mermaid-live-editor`
        }
      : {}
  }
};

export default config;
