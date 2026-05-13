import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    ignores: ['.angular/**', '.nx/**', 'dist/**', 'coverage/**', 'node_modules/**', '**/*.js'],
  },

  // TypeScript files
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@angular-eslint/directive-selector': ['error', {
        type: 'attribute', prefix: 'app', style: 'camelCase',
      }],
      '@angular-eslint/component-selector': ['error', {
        type: 'element', prefix: 'app', style: 'kebab-case',
      }],
    },
  },

  // HTML templates
  {
    files: ['**/*.html'],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },

  prettier,
);
