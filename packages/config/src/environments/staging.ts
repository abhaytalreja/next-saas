import { type BaseConfig } from './base';
import {
  productionDatabaseDefaults,
  productionAuthDefaults,
  developmentEmailDefaults,
  productionStorageDefaults,
  developmentBillingDefaults,
  productionIntegrationsDefaults,
  productionMonitoringDefaults,
} from '../schemas';

/**
 * Staging Environment Configuration
 * 
 * This configuration is optimized for staging/pre-production deployment with:
 * - Production-like security settings but more relaxed for testing
 * - Enhanced logging and monitoring for debugging
 * - Test integrations and sandbox services
 * - Similar to production but with development conveniences
 */

export const stagingConfig: Partial<BaseConfig> = {
  // Application metadata for staging
  app: {
    name: 'NextSaaS Staging',
    version: '1.0.0-staging',
    description: 'NextSaaS - Staging Environment',
    url: process.env.APP_URL || 'https://staging.nextsaas.com',
    apiUrl: process.env.API_URL || 'https://staging-api.nextsaas.com',
    supportEmail: process.env.SUPPORT_EMAIL || 'staging@nextsaas.com',
    adminEmail: process.env.ADMIN_EMAIL || 'admin-staging@nextsaas.com',
    companyName: process.env.COMPANY_NAME || 'NextSaaS Staging',
  },

  // Environment settings for staging
  env: {
    NODE_ENV: 'staging',
    DEBUG: Boolean(process.env.DEBUG),
    LOG_LEVEL: 'debug', // More verbose logging for staging
    PORT: parseInt(process.env.PORT || '3000'),
    HOST: process.env.HOST || '0.0.0.0',
    TIMEZONE: process.env.TZ || 'UTC',
  },

  // Feature flags for staging - enable all for testing
  features: {
    // Core features
    authentication: true,
    billing: true,
    subscriptions: true,
    fileUploads: true,
    emailNotifications: true,
    
    // Advanced features - enabled for testing
    multiTenant: true,
    apiRateLimiting: true,
    advancedAnalytics: true,
    realTimeFeatures: true,
    webhookSupport: true,
    
    // Beta features - enabled for testing
    aiIntegration: true,
    advancedReporting: true,
    customDomains: true,
    whiteLabeling: true,
    
    // Development features - enabled for debugging
    debugMode: Boolean(process.env.DEBUG),
    performanceTracking: true,
    errorReporting: true,
    metricsCollection: true,
  },

  // Security settings - production-like but more relaxed
  security: {
    cors: {
      enabled: true,
      origin: [
        'https://staging.nextsaas.com',
        'https://staging-admin.nextsaas.com',
        ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
    rateLimit: {
      enabled: true,
      windowMs: 900000, // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '200'), // Higher limit for testing
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    csp: {
      enabled: true,
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-eval'", 'https://js.stripe.com'], // Allow eval for debugging
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.stripe.com', 'wss:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    https: {
      enforced: true,
      hsts: {
        enabled: true,
        maxAge: 31536000,
        includeSubDomains: false, // More flexible for staging subdomains
        preload: false,
      },
    },
    api: {
      keyRotation: false, // Disabled for consistent testing
      requestSigning: false,
      ipWhitelist: [], // No IP restrictions for staging
      maxPayloadSize: '25mb', // Larger for testing
    },
  },

  // Cache settings optimized for staging
  cache: {
    enabled: true,
    defaultTtl: 1800, // 30 minutes - shorter for faster testing
    memory: {
      enabled: false,
      maxSize: 1000,
      ttl: 1800,
    },
    redis: {
      enabled: true,
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '1'), // Different DB from production
      keyPrefix: 'nextsaas:staging:cache:',
      ttl: 1800,
    },
    strategies: {
      api: 'redis',
      database: 'redis',
      sessions: 'redis',
      static: 'memory',
    },
  },

  // API settings for staging
  api: {
    versioning: {
      enabled: true,
      strategy: 'url',
      defaultVersion: 'v1',
      supportedVersions: ['v1', 'v2'], // Include beta versions for testing
      deprecationNotice: true,
    },
    documentation: {
      enabled: true, // Always enabled in staging
      path: '/api/docs',
      ui: 'swagger',
      openapi: {
        version: '3.0.0',
        title: 'NextSaaS Staging API',
        description: 'NextSaaS API Documentation - Staging Environment',
      },
    },
    pagination: {
      enabled: true,
      defaultLimit: 25,
      maxLimit: 100,
      strategy: 'cursor',
    },
    response: {
      envelope: true,
      timestamping: true,
      requestId: true,
      camelCase: true,
    },
  },

  // Service configurations for staging
  database: {
    ...productionDatabaseDefaults,
    url: process.env.DATABASE_URL!,
    ssl: {
      enabled: true,
      rejectUnauthorized: false, // More flexible SSL for staging
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '3'),
      max: parseInt(process.env.DB_POOL_MAX || '10'),
    },
    logging: {
      enabled: true,
      level: 'debug',
      queries: Boolean(process.env.LOG_QUERIES),
      slowQueries: true,
    },
  },

  auth: {
    ...productionAuthDefaults,
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: 'HS256',
      issuer: process.env.JWT_ISSUER || 'nextsaas-staging',
    },
    session: {
      provider: 'redis',
      secret: process.env.SESSION_SECRET!,
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400'),
      secure: true,
      httpOnly: true,
      sameSite: 'lax', // More flexible for testing
      redis: {
        url: process.env.REDIS_URL,
        keyPrefix: 'nextsaas:staging:session:',
      },
    },
    passwordPolicy: {
      ...productionAuthDefaults.passwordPolicy,
      minLength: 8, // Slightly more relaxed for testing
      maxAttempts: 10, // More attempts for testing
    },
  },

  email: {
    ...developmentEmailDefaults,
    provider: process.env.EMAIL_PROVIDER as any || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: Boolean(process.env.SMTP_SECURE),
      auth: {
        user: process.env.SMTP_USER || 'staging',
        pass: process.env.SMTP_PASS || 'staging',
      },
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY!,
      sandboxMode: true, // Use sandbox mode in staging
    },
    sender: {
      name: process.env.FROM_NAME || 'NextSaaS Staging',
      email: process.env.FROM_EMAIL || 'staging@nextsaas.com',
    },
    development: {
      enabled: true,
      logEmails: true,
      saveToFile: true,
      previewEmails: true,
    },
  },

  storage: {
    ...productionStorageDefaults,
    provider: process.env.STORAGE_PROVIDER as any || 'aws-s3',
    awsS3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || 'nextsaas-staging',
    },
    uploads: {
      maxFileSize: 25 * 1024 * 1024, // 25MB for testing
      maxFiles: 20,
      virusScanning: false, // Disabled for cost savings in staging
    },
    cdn: {
      enabled: Boolean(process.env.CDN_URL),
      baseUrl: process.env.CDN_URL,
      cacheTtl: 3600, // 1 hour
      purgeOnUpload: false, // Save costs in staging
    },
  },

  billing: {
    ...developmentBillingDefaults,
    provider: 'stripe',
    testMode: true, // Always use test mode in staging
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      apiVersion: '2023-10-16',
    },
    webhooks: {
      enabled: true,
      url: `${process.env.APP_URL}/api/webhooks/billing`,
    },
  },

  integrations: {
    ...productionIntegrationsDefaults,
    global: {
      enabledInDevelopment: false,
      enabledInStaging: true,
      enabledInProduction: false,
    },
    analytics: {
      googleAnalytics: {
        enabled: Boolean(process.env.GA_MEASUREMENT_ID),
        measurementId: process.env.GA_MEASUREMENT_ID,
        enhancedEcommerce: false, // Disabled to avoid test data
      },
    },
    development: {
      sentry: {
        enabled: Boolean(process.env.SENTRY_DSN),
        dsn: process.env.SENTRY_DSN,
        environment: 'staging',
        sampleRate: 1.0, // Capture all errors in staging
        tracesSampleRate: 0.1,
      },
    },
    communication: {
      slack: {
        enabled: Boolean(process.env.SLACK_WEBHOOK_URL),
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channels: {
          alerts: '#staging-alerts',
          errors: '#staging-errors',
        },
        notifications: {
          newSignups: false, // Avoid spam from test signups
          newPayments: false,
          errors: true,
          downtimes: true,
        },
      },
    },
  },

  monitoring: {
    ...productionMonitoringDefaults,
    enabled: true,
    environment: 'staging',
    logging: {
      enabled: true,
      level: 'debug',
      console: {
        enabled: false,
      },
      file: {
        enabled: true,
        filename: './logs/staging.log',
      },
      remote: {
        enabled: Boolean(process.env.LOG_ENDPOINT),
        endpoint: process.env.LOG_ENDPOINT,
        apiKey: process.env.LOG_API_KEY,
      },
    },
    errorTracking: {
      enabled: true,
      reporting: {
        includeSourceCode: true, // Include for debugging
        includeRequestData: true,
      },
      filtering: {
        sampleRate: 1.0, // Capture all errors
      },
      notifications: {
        enabled: true,
        channels: ['slack'],
        threshold: 5,
      },
    },
    alerting: {
      enabled: true,
      channels: {
        slack: {
          enabled: Boolean(process.env.SLACK_WEBHOOK_URL),
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: '#staging-alerts',
        },
      },
    },
  },
};

// Required environment variables for staging
export const stagingRequiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'APP_URL',
];

// Environment variable defaults for staging
export const stagingEnvVars = {
  // Application
  NODE_ENV: 'staging',
  APP_URL: 'https://staging.nextsaas.com',
  API_URL: 'https://staging-api.nextsaas.com',
  
  // Database
  DB_POOL_MIN: '3',
  DB_POOL_MAX: '10',
  
  // Authentication
  JWT_EXPIRES_IN: '24h',
  SESSION_MAX_AGE: '86400',
  
  // Email
  EMAIL_PROVIDER: 'smtp',
  FROM_EMAIL: 'staging@nextsaas.com',
  FROM_NAME: 'NextSaaS Staging',
  
  // Storage
  STORAGE_PROVIDER: 'aws-s3',
  AWS_REGION: 'us-east-1',
  S3_BUCKET: 'nextsaas-staging',
  
  // Cache
  REDIS_DB: '1',
  
  // Security
  RATE_LIMIT_MAX: '200',
  
  // Features
  DEBUG: 'false',
  LOG_LEVEL: 'debug',
  LOG_QUERIES: 'false',
  
  // Monitoring
  SENTRY_DSN: '', // Optional
  SLACK_WEBHOOK_URL: '', // Optional
};

export default stagingConfig;