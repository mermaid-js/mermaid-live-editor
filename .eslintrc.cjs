module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		// 'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'prettier'
	],
	plugins: ['svelte3', 'tailwindcss', '@typescript-eslint', 'es', 'vitest'],
	ignorePatterns: [
		'docs/*',
		'*.cjs',
		'*.js',
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
		ecmaVersion: 2020,
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
		extraFileExtensions: ['.svelte'],
		allowAutomaticSingleRunInference: true
	},
	env: {
		browser: true,
		es2020: true
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
