// Flat ESLint config migrated from legacy .eslintrc.json for ESLint v9
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  // 1. Ignore large prototype / experimental pages to cut noise (temporary)
  {
    ignores: [
      'client/src/pages/modern-*',
      'client/src/pages/working-dashboard.tsx',
      'client/src/pages/social-new.tsx'
    ]
  },
  // 2. Base JS recommended
  js.configs.recommended,
  // 3. TypeScript + React + a11y rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2021,
        sourceType: 'module'
        // NOTE: Omit project for speed & to avoid test parsing issues; add back if type-aware rules needed
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Extra globals occasionally referenced
        navigator: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      // Accessibility (subset – escalate later once codebase cleaned)
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // TS / general
      'no-unused-vars': 'off', // use the TS-specific rule instead
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  // 4. Tests override – vitest globals & relaxed parsing
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2021,
        sourceType: 'module'
        // Deliberately no project to avoid parserOptions.project lookup cost/errors
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest
      }
    },
    rules: {
      // Allow unused test helper params (underscore pattern already covered)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }]
    }
  }
];
