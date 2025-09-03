import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import sortKeysPlugin from 'eslint-plugin-sort-keys';
import svelte from 'eslint-plugin-svelte';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.strict,
  ...ts.configs.stylistic,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
      // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      'no-undef': 'off'
    }
  },
  {
    plugins: {
      unicorn: eslintPluginUnicorn
    },
    rules: {
      'unicorn/no-null': 'off',
      'unicorn/filename-case': 'off'
    }
  },
  {
    files: ['src/**'],
    plugins: {
      'sort-keys': sortKeysPlugin
    },
    rules: {
      'sort-keys/sort-keys-fix': ['error', 'asc', { minKeys: 5 }]
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    },
    rules: {
      'svelte/no-unused-props': 'off'
    }
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
);
