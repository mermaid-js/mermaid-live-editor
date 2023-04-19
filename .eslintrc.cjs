module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'plugin:unicorn/recommended',
    'prettier'
  ],
  plugins: [
    'svelte3',
    'tailwindcss',
    '@typescript-eslint',
    'es',
    'vitest',
    'no-only-tests',
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
    { files: ['*.svelte'], processor: 'svelte3/svelte3' },
    {
      files: ['*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
        'prettier'
      ]
    }
  ],
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
    'es/no-regexp-lookbehind-assertions': 'error',
    curly: ['error', 'all'],
    'no-only-tests/no-only-tests': 'error',
    'unicorn/no-null': 'off',
    'unicorn/filename-case': [
      'error',
      {
        case: 'camelCase'
      }
    ],
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          ctx: true,
          db: true,
          doc: true,
          env: true,
          fn: true,
          i: true,
          param: true,
          req: true,
          res: true,
          str: true,
          searchParams: true,
          temp: true,
          ImportMetaEnv: true
        }
      }
    ]
  }
};
