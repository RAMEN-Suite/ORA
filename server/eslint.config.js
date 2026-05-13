import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  // Ignore build output
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'openapi/**', '**/*.js'],
  },

  // Base JS recommended
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Node environment globals
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  prettier,
];
