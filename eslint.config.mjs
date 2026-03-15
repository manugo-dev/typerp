export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.nx/**', '**/*.js'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Basic rules for the monorepo root
      'no-console': 'off',
    },
  },
];
