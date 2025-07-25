const path = require('path')

module.exports = {
  displayName: 'auth',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts'],
  setupFiles: ['<rootDir>/src/test-utils/env.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@nextsaas/auth/(.*)$': '<rootDir>/src/$1',
    '^@nextsaas/ui$': '<rootDir>/../ui/src',
    '^@nextsaas/ui/(.*)$': '<rootDir>/../ui/src/$1',
    '^@nextsaas/supabase$': '<rootDir>/../supabase/src',
    '^@nextsaas/supabase/(.*)$': '<rootDir>/../supabase/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '@supabase/supabase-js': '<rootDir>/src/test-utils/supabase-mock.ts',
    '@supabase/auth-helpers-react': '<rootDir>/src/test-utils/auth-helpers-mock.ts',
    '@supabase/auth-helpers-nextjs': '<rootDir>/src/test-utils/auth-helpers-mock.ts',
    '^@headlessui/react$': '<rootDir>/src/test-utils/headlessui-mock.ts',
    '^@heroicons/(.*)$': '<rootDir>/src/test-utils/heroicons-mock.ts',
    '^lucide-react$': '<rootDir>/src/test-utils/lucide-mock.ts',
    '^@backblaze-b2/client$': '<rootDir>/src/test-utils/b2-client-mock.ts'
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '\\.visual\\.test\\.(ts|tsx)$',
    '\\.e2e\\.test\\.(ts|tsx)$',
    '/e2e/',
    '/integration/'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/integration/**',
    '!src/**/e2e/**',
    '!src/test-utils/**',
    '!src/index.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 15000,
  maxWorkers: 4,
  clearMocks: true,
  restoreMocks: true
}