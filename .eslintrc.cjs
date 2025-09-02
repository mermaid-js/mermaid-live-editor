module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'plugin:unicorn/recommended',
    'plugin:svelte/recommended',
    'plugin:svelte/prettier',
    'prettier'
  ],
  plugins: [
    'tailwindcss',
    '@typescript-eslint',
    'es',
    'vitest',
    'no-only-tests',
    'sort-keys',
    'unicorn'
  ],
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
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
    {
      files: ['*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
        'prettier'
      ]
    },
    {
      files: ['**/components/ui/**'],
      rules: {
        'unicorn/prefer-export-from': 'off',
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/explicit-length-check': 'off',
        'sort-keys/sort-keys-fix': 'off'
      }
    }
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
    extraFileExtensions: ['.svelte']
  },
  env: {
    browser: true,
    es2020: true
  },
  rules: {
    'sort-keys/sort-keys-fix': ['error', 'asc', { minKeys: 5 }],
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-ignore': 'allow-with-description'
      }
    ],
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    'es/no-regexp-lookbehind-assertions': 'error',
    curly: ['error', 'all'],
    'no-only-tests/no-only-tests': 'error'
  }
};
