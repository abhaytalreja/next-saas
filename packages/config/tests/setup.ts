import { beforeAll, afterAll, afterEach } from 'vitest';

// Setup test environment
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Mock console methods to reduce noise
  global.console = {
    ...console,
    warn: () => {},
    error: () => {},
  };
});

// Cleanup after each test
afterEach(() => {
  // Clear any test environment variables
  const testEnvVars = Object.keys(process.env).filter(key => 
    key.startsWith('TEST_') || key.startsWith('MOCK_')
  );
  
  testEnvVars.forEach(key => {
    delete process.env[key];
  });
});

// Cleanup after all tests
afterAll(() => {
  // Reset NODE_ENV
  delete process.env.NODE_ENV;
  
  // Restore console
  global.console = console;
});