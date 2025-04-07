import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  compilerOptions: {
    compatibility: {
      componentApi: 4 // 👈 pour réactiver le support de `new Component(...)`
    }
  },
  preprocess: [
    sveltePreprocess({
      postcss: true
    })
  ],
  kit: {
    alias: {
      '$/*': './src/lib/*'
    },
    adapter: adapter()
  }
};

export default config;
