module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		// 'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'prettier'
	],
	plugins: ['svelte3', 'tailwindcss', '@typescript-eslint', 'es'],
	ignorePatterns: [
		'docs/*',
		'*.cjs',
		'*.md',
		'snapshots.js',
		'svelte.config.js',
		'renovate.json',
		'package.json',
		'tsconfig.json'
	],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2019,
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		'@typescript-eslint/ban-ts-comment': [
			'error',
			{
				'ts-ignore': 'allow-with-description'
			}
		],
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'es/no-regexp-lookbehind-assertions': 'error'
	}
};
