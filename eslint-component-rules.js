/**
 * ESLint Rules for Component Consistency
 * Add these rules to your .eslintrc.js to enforce universal component standards
 */

module.exports = {
  rules: {
    // Prevent relative imports for shared components
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../components/*', './components/*'],
            message: 'Use absolute imports: @/components/... instead of relative imports for shared components',
          },
          {
            group: ['**/StreamingLogos', '**/streaming-logos-*'],
            message: 'Use the canonical StreamingLogos: import StreamingLogos from "@/components/streaming-logos"',
          },
        ],
      },
    ],

    // Enforce consistent component naming
    'filename-rules/match': [
      'error',
      {
        '.tsx': '^[A-Z][a-zA-Z0-9]*$|^[a-z][a-z0-9-]*$', // PascalCase or kebab-case
      },
    ],
  },

  // Custom rules for component standards
  overrides: [
    {
      files: ['client/src/components/**/*.tsx'],
      rules: {
        // Require component documentation
        'require-jsdoc': [
          'warn',
          {
            require: {
              FunctionDeclaration: true,
              MethodDefinition: true,
              ClassDeclaration: true,
              ArrowFunctionExpression: false,
            },
          },
        ],
      },
    },
  ],
};