import { sveltekit } from '@sveltejs/kit/vite';
/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	envPrefix: 'MERMAID_',
	optimizeDeps: { include: ['mermaid'] }
};
export default config;
