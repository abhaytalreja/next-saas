const { createJestConfig } = require('../../jest.config.base')

const config = createJestConfig({
  displayName: 'web',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@nextsaas/auth$': '<rootDir>/../../packages/auth/src',
    '^@nextsaas/auth/(.*)$': '<rootDir>/../../packages/auth/src/$1',
    '^@nextsaas/ui$': '<rootDir>/../../packages/ui/src',
    '^@nextsaas/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
    '^@nextsaas/supabase$': '<rootDir>/../../packages/supabase/src',
    '^@nextsaas/supabase/(.*)$': '<rootDir>/../../packages/supabase/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/test-utils/**',
    '!src/app/**/layout.tsx',
    '!src/app/**/page.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true
        },
        transform: {
          react: {
            runtime: 'automatic'
          }
        }
      }
    }]
  },
  testTimeout: 10000
})

module.exports = config