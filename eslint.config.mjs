// @ts-check
import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['node_modules/', 'test-results/', 'playwright-report/', 'blob-report/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs', 'scripts/*.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // A missing `await` on a Playwright call is the most common cause of flaky tests.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Assertions live in `ae.expect*` methods, not directly in specs.
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect[A-Z]'] }],
    },
  },
  {
    // Rules for all Playwright code, including the app class shared with Cucumber.
    files: ['src/**/*.ts', 'tests/**/*.ts', 'features/**/*.ts'],
    plugins: playwright.configs['flat/recommended'].plugins,
    rules: {
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
    },
  },
  {
    // Specs and step definitions speak business language only: selectors belong in `locators.ts`.
    files: ['tests/automation-exercise/**/*.ts', 'features/step_definitions/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.property.name=/^(locator|getBy[A-Z]\\w*|\\$\\$?|waitForSelector)$/]',
          message: 'No selectors in specs or step definitions. Add a locator to locators.ts and an ae.* method.',
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: { require: 'readonly', module: 'writable', __dirname: 'readonly', process: 'readonly', console: 'readonly' },
    },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
