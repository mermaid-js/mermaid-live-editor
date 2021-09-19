module.exports = {
	mode: 'jit',
	plugins: [require('daisyui')],
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	variants: {
		extend: {}
	}
};
