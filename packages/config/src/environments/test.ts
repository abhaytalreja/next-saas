import { type BaseConfig } from './base';
import {
  developmentDatabaseDefaults,
  developmentAuthDefaults,
  developmentEmailDefaults,
  developmentStorageDefaults,
  developmentBillingDefaults,
  developmentIntegrationsDefaults,
  developmentMonitoringDefaults,
} from '../schemas';

/**
 * Test Environment Configuration
 * 
 * This configuration is optimized for automated testing with:
 * - Minimal external dependencies
 * - Fast execution settings
 * - Isolated test data
 * - Deterministic behavior
 * - No side effects (email, payments, etc.)
 */

export const testConfig: Partial<BaseConfig> = {
  // Application metadata for testing
  app: {
    name: 'NextSaaS Test',
    version: '1.0.0-test',
    description: 'NextSaaS - Test Environment',
    url: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api',
    supportEmail: 'test@nextsaas.local',
    adminEmail: 'admin-test@nextsaas.local',
    companyName: 'NextSaaS Test',
  },

  // Environment settings for testing
  env: {
    NODE_ENV: 'test',
    DEBUG: false, // Disable debug to avoid noise in tests
    LOG_LEVEL: 'error', // Only log errors during tests
    PORT: 3001, // Different port to avoid conflicts
    HOST: 'localhost',
    TIMEZONE: 'UTC',
  },

  // Feature flags for testing - enable all for comprehensive testing
  features: {
    // Core features - enabled for testing
    authentication: true,
    billing: true,
    subscriptions: true,
    fileUploads: true,
    emailNotifications: true,
    
    // Advanced features - enabled for testing
    multiTenant: true,
    apiRateLimiting: false, // Disabled for test performance
    advancedAnalytics: true,
    realTimeFeatures: true,
    webhookSupport: true,
    
    // Beta features - enabled for testing
    aiIntegration: true,
    advancedReporting: true,
    customDomains: true,
    whiteLabeling: true,
    
    // Development features - minimal for testing
    debugMode: false,
    performanceTracking: false, // Disabled for test performance
    errorReporting: false, // Disabled to avoid noise
    metricsCollection: false, // Disabled for test performance
  },

  // Security settings for testing - minimal but functional
  security: {
    cors: {
      enabled: true,
      origin: true, // Allow all origins for testing
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
    rateLimit: {
      enabled: false, // Disabled for test performance
      windowMs: 900000,
      maxRequests: 10000, // High limit for testing
    },
    csp: {
      enabled: false, // Disabled for testing
    },
    https: {
      enforced: false,
      hsts: {
        enabled: false,
      },
    },
    api: {
      keyRotation: false,
      requestSigning: false,
      ipWhitelist: [], // No IP restrictions for testing
      maxPayloadSize: '100mb', // Large payloads for testing
    },
  },

  // Cache settings for testing - minimal caching
  cache: {
    enabled: false, // Disabled for consistent test results
    defaultTtl: 0, // No caching
    memory: {
      enabled: false,
      maxSize: 100,
      ttl: 0,
    },
    redis: {
      enabled: false,
    },
    strategies: {
      api: 'memory',
      database: 'memory',
      sessions: 'memory',
      static: 'memory',
    },
  },

  // API settings for testing
  api: {
    versioning: {
      enabled: true,
      strategy: 'url',
      defaultVersion: 'v1',
      supportedVersions: ['v1', 'v2'], // Include all versions for testing
      deprecationNotice: false, // No deprecation notices in tests
    },
    documentation: {
      enabled: false, // Disabled for testing
      path: '/api/docs',
      ui: 'swagger',
      openapi: {
        version: '3.0.0',
        title: 'NextSaaS Test API',
        description: 'NextSaaS API Documentation - Test Environment',
      },
    },
    pagination: {
      enabled: true,
      defaultLimit: 5, // Small for faster tests
      maxLimit: 20, // Small for faster tests
      strategy: 'offset',
    },
    response: {
      envelope: true,
      timestamping: false, // Disabled for deterministic tests
      requestId: false, // Disabled for deterministic tests
      camelCase: true,
    },
  },

  // Service configurations for testing
  database: {
    ...developmentDatabaseDefaults,
    // Use in-memory database for testing
    provider: 'sqlite',
    url: process.env.TEST_DATABASE_URL || 'sqlite:///:memory:',
    sqlite: {
      filename: ':memory:',
      options: {
        enableWAL: false,
        busyTimeout: 5000,
      },
    },
    ssl: {
      enabled: false,
    },
    pool: {
      min: 1,
      max: 5, // Small pool for testing
    },
    logging: {
      enabled: false, // Disabled for test performance
      level: 'error',
      queries: false,
      slowQueries: false,
    },
    migrations: {
      enabled: true,
      autoRun: true, // Auto-run migrations for tests
      directory: './migrations',
    },
    seeds: {
      enabled: true,
      autoRun: true, // Auto-run seeds for tests
      directory: './seeds',
    },
  },

  auth: {
    ...developmentAuthDefaults,
    jwt: {
      secret: process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only-minimum-32-chars',
      expiresIn: '1h', // Short expiry for testing
      algorithm: 'HS256',
      issuer: 'nextsaas-test',
    },
    session: {
      provider: 'memory',
      secret: process.env.SESSION_SECRET || 'test-session-secret-for-testing-only-minimum-32-chars',
      maxAge: 3600, // 1 hour
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
    },
    passwordPolicy: {
      minLength: 6, // Relaxed for testing
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSymbols: false,
      maxAttempts: 100, // High limit for testing
      lockoutDuration: 0, // No lockout for testing
    },
    providers: {
      email: {
        enabled: true,
        requireVerification: false, // Skip email verification in tests
      },
      google: {
        enabled: false, // Disabled for testing
      },
      github: {
        enabled: false, // Disabled for testing
      },
    },
  },

  email: {
    ...developmentEmailDefaults,
    provider: 'test', // Use test provider
    test: {
      enabled: true,
      logEmails: false, // Don't log emails during tests
      saveToFile: false, // Don't save to file during tests
    },
    sender: {
      name: 'NextSaaS Test',
      email: 'test@nextsaas.local',
    },
    templates: {
      path: './templates',
      cache: false, // Disable caching for testing
    },
    development: {
      enabled: false, // Disabled for testing
      logEmails: false,
      saveToFile: false,
      previewEmails: false,
    },
  },

  storage: {
    ...developmentStorageDefaults,
    provider: 'memory', // Use memory storage for testing
    memory: {
      enabled: true,
      maxSize: 10 * 1024 * 1024, // 10MB limit for testing
    },
    uploads: {
      maxFileSize: 5 * 1024 * 1024, // 5MB for testing
      maxFiles: 5, // Small limit for testing
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/plain'],
      virusScanning: false, // Disabled for testing
    },
    cdn: {
      enabled: false, // Disabled for testing
    },
    cleanup: {
      enabled: true,
      interval: 60000, // 1 minute for testing
      maxAge: 3600000, // 1 hour for testing
    },
  },

  billing: {
    ...developmentBillingDefaults,
    provider: 'test', // Use test provider
    testMode: true,
    test: {
      enabled: true,
      autoSucceed: true, // Auto-succeed payments for testing
      simulateFailures: false, // Don't simulate failures by default
    },
    webhooks: {
      enabled: false, // Disabled for testing
    },
    plans: [], // No plans for testing
    features: [], // No features for testing
  },

  integrations: {
    ...developmentIntegrationsDefaults,
    global: {
      enabledInDevelopment: false,
      enabledInStaging: false,
      enabledInProduction: false,
      enabledInTest: true,
    },
    analytics: {
      googleAnalytics: {
        enabled: false, // Disabled for testing
      },
    },
    development: {
      sentry: {
        enabled: false, // Disabled for testing
      },
    },
    communication: {
      slack: {
        enabled: false, // Disabled for testing
      },
    },
    support: {
      intercom: {
        enabled: false, // Disabled for testing
      },
      zendesk: {
        enabled: false, // Disabled for testing
      },
    },
  },

  monitoring: {
    ...developmentMonitoringDefaults,
    enabled: false, // Disabled for testing
    environment: 'test',
    logging: {
      enabled: false, // Disabled for testing
      level: 'error',
      console: {
        enabled: false,
      },
      file: {
        enabled: false,
      },
      remote: {
        enabled: false,
      },
    },
    metrics: {
      enabled: false, // Disabled for testing
    },
    tracing: {
      enabled: false, // Disabled for testing
    },
    errorTracking: {
      enabled: false, // Disabled for testing
    },
    healthChecks: {
      enabled: false, // Disabled for testing
    },
    alerting: {
      enabled: false, // Disabled for testing
    },
  },
};

// Required environment variables for testing (minimal)
export const testRequiredEnvVars = [
  // Most variables are optional for testing
];

// Environment variable defaults for testing
export const testEnvVars = {
  // Application
  NODE_ENV: 'test',
  APP_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:3000/api',
  PORT: '3001',
  HOST: 'localhost',
  
  // Database
  TEST_DATABASE_URL: 'sqlite:///:memory:',
  
  // Authentication
  JWT_SECRET: 'test-jwt-secret-for-testing-only-minimum-32-chars',
  SESSION_SECRET: 'test-session-secret-for-testing-only-minimum-32-chars',
  
  // Email
  EMAIL_PROVIDER: 'test',
  FROM_EMAIL: 'test@nextsaas.local',
  FROM_NAME: 'NextSaaS Test',
  
  // Storage
  STORAGE_PROVIDER: 'memory',
  
  // Billing
  BILLING_PROVIDER: 'test',
  
  // Features
  DEBUG: 'false',
  LOG_LEVEL: 'error',
  ENABLE_RATE_LIMITING: 'false',
  ENABLE_CACHING: 'false',
  ENABLE_MONITORING: 'false',
  
  // Test specific
  TEST_TIMEOUT: '30000', // 30 seconds
  TEST_PARALLEL: 'true',
  TEST_VERBOSE: 'false',
  NEXT_PUBLIC_ENV: 'test',
  NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
};

// Test-specific validation overrides
export const testValidationOverrides = {
  // Skip all external validations
  skipEmailValidation: true,
  skipPhoneValidation: true,
  skipDomainValidation: true,
  skipSSLValidation: true,
  
  // Allow test data
  allowTestData: true,
  allowMockData: true,
  allowFakeData: true,
  
  // Bypass security measures
  bypassRateLimit: true,
  bypassCaptcha: true,
  bypassAuthentication: false, // Keep auth for proper testing
  
  // Enhanced testing features
  enableTestHelpers: true,
  enableMockServices: true,
  enableDataFactories: true,
  enableTestFixtures: true,
  
  // Performance optimizations
  skipSlowOperations: true,
  skipExternalAPIs: true,
  skipFileSystem: true,
  skipNetworkRequests: true,
  
  // Deterministic behavior
  useDeterministicIds: true,
  useDeterministicDates: true,
  useDeterministicRandom: true,
  
  // Test isolation
  isolateTests: true,
  resetBetweenTests: true,
  cleanupAfterTests: true,
};

// Test environment setup helpers
export const testSetupHelpers = {
  // Database helpers
  async setupDatabase() {
    // Setup in-memory database for testing
    console.log('Setting up test database...');
  },
  
  async cleanupDatabase() {
    // Cleanup test database
    console.log('Cleaning up test database...');
  },
  
  // Test data helpers
  async seedTestData() {
    // Seed test data
    console.log('Seeding test data...');
  },
  
  async cleanupTestData() {
    // Cleanup test data
    console.log('Cleaning up test data...');
  },
  
  // Mock helpers
  setupMocks() {
    // Setup mocks for external services
    console.log('Setting up mocks...');
  },
  
  cleanupMocks() {
    // Cleanup mocks
    console.log('Cleaning up mocks...');
  },
};

export default testConfig;