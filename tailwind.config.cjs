const { tailwindExtractor } = require('tailwindcss/lib/lib/purgeUnusedStyles');

module.exports = {
	mode: 'jit',
	darkMode: 'media',
	plugins: [require('daisyui')],
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	variants: {
		extend: {}
	}
};
