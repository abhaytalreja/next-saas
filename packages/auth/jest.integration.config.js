const path = require('path')

module.exports = {
  displayName: 'auth-integration',
  testEnvironment: 'node', // Node environment for integration tests
  roots: ['<rootDir>/src/integration'],
  setupFilesAfterEnv: ['<rootDir>/src/integration/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@nextsaas/auth/(.*)$': '<rootDir>/src/$1',
    '^@nextsaas/ui$': '<rootDir>/../ui/src',
    '^@nextsaas/ui/(.*)$': '<rootDir>/../ui/src/$1',
    '^@nextsaas/supabase$': '<rootDir>/../supabase/src',
    '^@nextsaas/supabase/(.*)$': '<rootDir>/../supabase/src/$1'
  },
  testMatch: [
    '<rootDir>/src/integration/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/integration/**/*.(integration|int).test.(ts|tsx|js|jsx)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '\\.unit\\.test\\.(ts|tsx)$',
    '\\.component\\.test\\.(ts|tsx)$'
  ],
  collectCoverageFrom: [
    'src/services/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/test-utils/**',
    '!src/integration/**'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 30000, // 30 seconds for integration tests
  maxWorkers: 2, // Limit workers for integration tests
  clearMocks: true,
  restoreMocks: true,
  
  // Global setup for integration tests
  globalSetup: '<rootDir>/src/integration/global-setup.ts',
  globalTeardown: '<rootDir>/src/integration/global-teardown.ts',
  
  // Fail if integration tests take too long
  testTimeout: 30000,
  
  // Environment variables for integration tests
  setupFiles: ['<rootDir>/src/integration/env.ts']
}