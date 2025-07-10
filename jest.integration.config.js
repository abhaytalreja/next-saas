const { createJestConfig } = require('./jest.config.base')

const config = createJestConfig({
  displayName: 'integration-tests',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/**/__tests__/integration/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/**/*.integration.(test|spec).(ts|tsx|js|jsx)'
  ],
  setupFilesAfterEnv: ['<rootDir>/test-setup/integration-setup.ts'],
  testTimeout: 30000, // Longer timeout for integration tests
  maxWorkers: 1, // Run integration tests sequentially to avoid conflicts
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    'apps/web/src/app/api/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{ts,tsx}',
    '!**/__tests__/**',
    '!**/test-utils/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@nextsaas/auth/(.*)$': '<rootDir>/packages/auth/src/$1',
    '^@nextsaas/ui$': '<rootDir>/packages/ui/src',
    '^@nextsaas/ui/(.*)$': '<rootDir>/packages/ui/src/$1',
  },
  globalSetup: '<rootDir>/test-setup/global-setup.ts',
  globalTeardown: '<rootDir>/test-setup/global-teardown.ts',
})

module.exports = config