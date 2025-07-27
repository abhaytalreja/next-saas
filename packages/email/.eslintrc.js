module.exports = {
  extends: ['@nextsaas/eslint-config/react-internal'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Email-specific rules
    'react/jsx-no-target-blank': 'off', // Email links often need target="_blank"
    'jsx-a11y/alt-text': ['error', {
      elements: ['img'],
      img: ['Image', 'Img'], // Allow React Email components
    }],
    'react/no-unescaped-entities': 'off', // Email content often has quotes/apostrophes
    'import/no-default-export': 'off', // Email templates use default exports
  },
  overrides: [
    {
      files: ['**/*.stories.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      rules: {
        'import/no-default-export': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};