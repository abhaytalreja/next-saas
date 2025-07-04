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
 * Development Environment Configuration
 * 
 * This configuration is optimized for local development with:
 * - Relaxed security settings for easier debugging
 * - Enhanced logging and error reporting
 * - Local services and test credentials
 * - Developer-friendly defaults
 */

export const developmentConfig: Partial<BaseConfig> = {
  // Application metadata for development
  app: {
    name: 'NextSaaS Development',
    version: '1.0.0-dev',
    description: 'NextSaaS - Development Environment',
    url: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api',
    supportEmail: 'dev@nextsaas.local',
    adminEmail: 'admin@nextsaas.local',
    companyName: 'NextSaaS Development',
  },

  // Environment settings
  env: {
    NODE_ENV: 'development',
    DEBUG: true,
    LOG_LEVEL: 'debug',
    PORT: 3000,
    HOST: 'localhost',
    TIMEZONE: 'UTC',
  },

  // Feature flags for development
  features: {
    // Core features
    authentication: true,
    billing: true,
    subscriptions: true,
    fileUploads: true,
    emailNotifications: true,
    
    // Advanced features - enabled for testing
    multiTenant: false,
    apiRateLimiting: false, // Disabled for easier development
    advancedAnalytics: true,
    realTimeFeatures: true,
    webhookSupport: true,
    
    // Beta features - enabled for development
    aiIntegration: true,
    advancedReporting: true,
    customDomains: false,
    whiteLabeling: true,
    
    // Development features
    debugMode: true,
    performanceTracking: true,
    errorReporting: true,
    metricsCollection: true,
  },

  // Security settings optimized for development
  security: {
    cors: {
      enabled: true,
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
    rateLimit: {
      enabled: false, // Disabled for development
      windowMs: 900000,
      maxRequests: 1000, // High limit for development
      skipSuccessfulRequests: true,
    },
    csp: {
      enabled: false, // Disabled for easier development
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
      ipWhitelist: [], // No IP restrictions in development
      maxPayloadSize: '50mb', // Larger payloads for testing
    },
  },

  // Cache settings for development
  cache: {
    enabled: true,
    defaultTtl: 300, // Shorter TTL for development (5 minutes)
    memory: {
      enabled: true,
      maxSize: 500,
      ttl: 300,
    },
    redis: {
      enabled: false, // Use memory cache by default
      host: 'localhost',
      port: 6379,
      db: 0,
      keyPrefix: 'nextsaas:dev:cache:',
      ttl: 300,
    },
    strategies: {
      api: 'memory',
      database: 'memory',
      sessions: 'memory',
      static: 'memory',
    },
  },

  // API settings for development
  api: {
    versioning: {
      enabled: true,
      strategy: 'url',
      defaultVersion: 'v1',
      supportedVersions: ['v1', 'v2'], // Include beta versions
      deprecationNotice: false, // No deprecation notices in dev
    },
    documentation: {
      enabled: true,
      path: '/api/docs',
      ui: 'swagger',
      openapi: {
        version: '3.0.0',
        title: 'NextSaaS Development API',
        description: 'NextSaaS API Documentation - Development Environment',
      },
    },
    pagination: {
      enabled: true,
      defaultLimit: 10, // Smaller for easier testing
      maxLimit: 50,
      strategy: 'offset',
    },
    response: {
      envelope: true,
      timestamping: true,
      requestId: true,
      camelCase: true,
    },
  },

  // Service configurations with development defaults
  database: {
    ...developmentDatabaseDefaults,
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nextsaas_dev',
  },

  auth: {
    ...developmentAuthDefaults,
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production-minimum-32-chars',
      expiresIn: '24h',
      algorithm: 'HS256',
      issuer: 'nextsaas-dev',
    },
    session: {
      provider: 'memory',
      secret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production-minimum-32-chars',
      maxAge: 86400, // 24 hours
      secure: false, // HTTP is fine for development
      httpOnly: true,
      sameSite: 'lax',
    },
  },

  email: {
    ...developmentEmailDefaults,
    provider: 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'test',
        pass: process.env.SMTP_PASS || 'test',
      },
    },
    sender: {
      name: 'NextSaaS Development',
      email: process.env.FROM_EMAIL || 'dev@nextsaas.local',
    },
  },

  storage: {
    ...developmentStorageDefaults,
    provider: 'local',
    local: {
      uploadPath: './uploads',
      publicPath: '/uploads',
      createDirectories: true,
      generateUniqueFilename: true,
    },
  },

  billing: {
    ...developmentBillingDefaults,
    provider: 'stripe',
    testMode: true,
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
      secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...',
      apiVersion: '2023-10-16',
    },
  },

  integrations: {
    ...developmentIntegrationsDefaults,
    global: {
      enabledInDevelopment: true,
      enabledInStaging: false,
      enabledInProduction: false,
    },
  },

  monitoring: {
    ...developmentMonitoringDefaults,
    enabled: true,
    environment: 'development',
  },
};

// Environment variable mappings for development
export const developmentEnvVars = {
  // Database
  DATABASE_URL: 'postgresql://postgres:password@localhost:5432/nextsaas_dev',
  
  // Authentication
  JWT_SECRET: 'dev-jwt-secret-change-in-production-minimum-32-chars',
  SESSION_SECRET: 'dev-session-secret-change-in-production-minimum-32-chars',
  
  // Email
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  SMTP_USER: 'test',
  SMTP_PASS: 'test',
  FROM_EMAIL: 'dev@nextsaas.local',
  
  // Storage
  STORAGE_PROVIDER: 'local',
  UPLOAD_PATH: './uploads',
  
  // Billing
  STRIPE_PUBLISHABLE_KEY: 'pk_test_...',
  STRIPE_SECRET_KEY: 'sk_test_...',
  STRIPE_WEBHOOK_SECRET: 'whsec_...',
  
  // Application
  NODE_ENV: 'development',
  PORT: '3000',
  HOST: 'localhost',
  APP_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:3000/api',
  
  // Features
  DEBUG: 'true',
  LOG_LEVEL: 'debug',
  ENABLE_RATE_LIMITING: 'false',
  ENABLE_CORS: 'true',
  ENABLE_CSP: 'false',
  
  // Development specific
  NEXT_PUBLIC_ENV: 'development',
  NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
};

// Development validation overrides
export const developmentValidationOverrides = {
  // Relax validation in development
  skipEmailValidation: true,
  skipPhoneValidation: true,
  allowTestData: true,
  bypassRateLimit: true,
  allowInsecurePasswords: true,
  skipCaptcha: true,
  
  // Enhanced debugging
  verboseErrors: true,
  includeStackTrace: true,
  logAllRequests: true,
  logAllQueries: true,
};

export default developmentConfig;