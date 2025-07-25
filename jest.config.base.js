const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Base Jest configuration that can be extended by individual packages
const baseConfig = {
  collectCoverageFrom: [
    '**/*.(ts|tsx)',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/*.config.js',
    '!**/*.config.ts',
  ],
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Next.js will handle transforms automatically
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testTimeout: 10000,
}

// Factory function to create Jest config for individual packages
function createJestConfigForPackage(customConfig = {}) {
  const config = {
    ...baseConfig,
    ...customConfig,
    moduleNameMapper: {
      ...baseConfig.moduleNameMapper,
      ...(customConfig.moduleNameMapper || {}),
    },
    collectCoverageFrom: [
      ...(customConfig.collectCoverageFrom || baseConfig.collectCoverageFrom),
    ],
  }
  
  return config
}

module.exports = { createJestConfig: createJestConfigForPackage, baseConfig }