import { type BaseConfig } from './base';
import {
  productionDatabaseDefaults,
  productionAuthDefaults,
  productionEmailDefaults,
  productionStorageDefaults,
  productionBillingDefaults,
  productionIntegrationsDefaults,
  productionMonitoringDefaults,
} from '../schemas';

/**
 * Production Environment Configuration
 * 
 * This configuration is optimized for production deployment with:
 * - Enhanced security settings
 * - Performance optimizations
 * - Comprehensive monitoring and alerting
 * - Production service integrations
 * - Strict validation and error handling
 */

export const productionConfig: Partial<BaseConfig> = {
  // Application metadata for production
  app: {
    name: 'NextSaaS',
    version: '1.0.0',
    description: 'NextSaaS - Modern SaaS Starter Kit',
    url: process.env.APP_URL || 'https://app.nextsaas.com',
    apiUrl: process.env.API_URL || 'https://api.nextsaas.com',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@nextsaas.com',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@nextsaas.com',
    companyName: process.env.COMPANY_NAME || 'NextSaaS Inc.',
  },

  // Environment settings for production
  env: {
    NODE_ENV: 'production',
    DEBUG: false,
    LOG_LEVEL: 'info',
    PORT: parseInt(process.env.PORT || '3000'),
    HOST: process.env.HOST || '0.0.0.0',
    TIMEZONE: process.env.TZ || 'UTC',
  },

  // Feature flags for production
  features: {
    // Core features
    authentication: true,
    billing: true,
    subscriptions: true,
    fileUploads: true,
    emailNotifications: true,
    
    // Advanced features
    multiTenant: Boolean(process.env.ENABLE_MULTI_TENANT),
    apiRateLimiting: true,
    advancedAnalytics: true,
    realTimeFeatures: Boolean(process.env.ENABLE_REAL_TIME),
    webhookSupport: true,
    
    // Beta features - controlled by environment variables
    aiIntegration: Boolean(process.env.ENABLE_AI_INTEGRATION),
    advancedReporting: Boolean(process.env.ENABLE_ADVANCED_REPORTING),
    customDomains: Boolean(process.env.ENABLE_CUSTOM_DOMAINS),
    whiteLabeling: Boolean(process.env.ENABLE_WHITE_LABELING),
    
    // Development features - disabled in production
    debugMode: false,
    performanceTracking: true,
    errorReporting: true,
    metricsCollection: true,
  },

  // Enhanced security settings for production
  security: {
    cors: {
      enabled: true,
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://app.nextsaas.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    rateLimit: {
      enabled: true,
      windowMs: 900000, // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    csp: {
      enabled: true,
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", 'https://js.stripe.com'],
        imgSrc: ["'self'", 'data:', 'https:', process.env.CDN_URL || ''].filter(Boolean),
        connectSrc: ["'self'", 'https://api.stripe.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    https: {
      enforced: true,
      hsts: {
        enabled: true,
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    },
    api: {
      keyRotation: Boolean(process.env.ENABLE_KEY_ROTATION),
      requestSigning: Boolean(process.env.ENABLE_REQUEST_SIGNING),
      ipWhitelist: process.env.API_IP_WHITELIST?.split(',') || [],
      maxPayloadSize: process.env.MAX_PAYLOAD_SIZE || '10mb',
    },
  },

  // Optimized cache settings for production
  cache: {
    enabled: true,
    defaultTtl: 3600, // 1 hour
    memory: {
      enabled: false, // Prefer Redis in production
      maxSize: 1000,
      ttl: 3600,
    },
    redis: {
      enabled: true,
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'nextsaas:prod:cache:',
      ttl: 3600,
    },
    strategies: {
      api: 'redis',
      database: 'redis',
      sessions: 'redis',
      static: 'cdn',
    },
  },

  // Production API settings
  api: {
    versioning: {
      enabled: true,
      strategy: 'url',
      defaultVersion: 'v1',
      supportedVersions: ['v1'],
      deprecationNotice: true,
    },
    documentation: {
      enabled: Boolean(process.env.ENABLE_API_DOCS),
      path: '/api/docs',
      ui: 'swagger',
      openapi: {
        version: '3.0.0',
        title: 'NextSaaS API',
        description: 'NextSaaS API Documentation',
      },
    },
    pagination: {
      enabled: true,
      defaultLimit: 25,
      maxLimit: 100,
      strategy: 'cursor', // More efficient for large datasets
    },
    response: {
      envelope: true,
      timestamping: true,
      requestId: true,
      camelCase: true,
    },
  },

  // Production service configurations
  database: {
    ...productionDatabaseDefaults,
    url: process.env.DATABASE_URL!,
    ssl: {
      enabled: true,
      rejectUnauthorized: true,
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      max: parseInt(process.env.DB_POOL_MAX || '20'),
    },
  },

  auth: {
    ...productionAuthDefaults,
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: 'HS256',
      issuer: process.env.JWT_ISSUER || 'nextsaas',
      audience: process.env.JWT_AUDIENCE,
    },
    session: {
      provider: 'redis',
      secret: process.env.SESSION_SECRET!,
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400'),
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      domain: process.env.SESSION_DOMAIN,
      redis: {
        url: process.env.REDIS_URL,
        keyPrefix: 'nextsaas:prod:session:',
      },
    },
  },

  email: {
    ...productionEmailDefaults,
    provider: process.env.EMAIL_PROVIDER as any || 'sendgrid',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY!,
      sandboxMode: false,
    },
    mailgun: {
      apiKey: process.env.MAILGUN_API_KEY!,
      domain: process.env.MAILGUN_DOMAIN!,
      testMode: false,
    },
    sender: {
      name: process.env.FROM_NAME || 'NextSaaS',
      email: process.env.FROM_EMAIL!,
      replyTo: process.env.REPLY_TO_EMAIL,
    },
  },

  storage: {
    ...productionStorageDefaults,
    provider: process.env.STORAGE_PROVIDER as any || 'aws-s3',
    awsS3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET!,
    },
    cdn: {
      enabled: true,
      baseUrl: process.env.CDN_URL,
      cacheTtl: 86400 * 7, // 7 days
      purgeOnUpload: true,
    },
  },

  billing: {
    ...productionBillingDefaults,
    provider: 'stripe',
    testMode: false,
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      apiVersion: '2023-10-16',
    },
  },

  integrations: {
    ...productionIntegrationsDefaults,
    global: {
      enabledInDevelopment: false,
      enabledInStaging: true,
      enabledInProduction: true,
    },
    analytics: {
      googleAnalytics: {
        enabled: Boolean(process.env.GA_MEASUREMENT_ID),
        measurementId: process.env.GA_MEASUREMENT_ID,
        enhancedEcommerce: true,
      },
    },
    development: {
      sentry: {
        enabled: Boolean(process.env.SENTRY_DSN),
        dsn: process.env.SENTRY_DSN,
        environment: 'production',
        sampleRate: 0.1,
        tracesSampleRate: 0.01,
      },
    },
  },

  monitoring: {
    ...productionMonitoringDefaults,
    enabled: true,
    environment: 'production',
    logging: {
      level: 'warn',
      remote: {
        enabled: Boolean(process.env.LOG_ENDPOINT),
        endpoint: process.env.LOG_ENDPOINT,
        apiKey: process.env.LOG_API_KEY,
      },
    },
  },
};

// Required environment variables for production
export const productionRequiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'FROM_EMAIL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'APP_URL',
  'API_URL',
];

// Optional but recommended environment variables
export const productionRecommendedEnvVars = [
  'REDIS_URL',
  'SENDGRID_API_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'S3_BUCKET',
  'SENTRY_DSN',
  'GA_MEASUREMENT_ID',
  'CDN_URL',
];

// Production environment variable mappings
export const productionEnvVars = {
  // Application
  NODE_ENV: 'production',
  APP_URL: 'https://app.nextsaas.com',
  API_URL: 'https://api.nextsaas.com',
  
  // Database
  DATABASE_URL: '', // Must be set
  DB_POOL_MIN: '5',
  DB_POOL_MAX: '20',
  
  // Authentication
  JWT_SECRET: '', // Must be set
  JWT_EXPIRES_IN: '24h',
  SESSION_SECRET: '', // Must be set
  SESSION_MAX_AGE: '86400',
  
  // Email
  EMAIL_PROVIDER: 'sendgrid',
  FROM_EMAIL: '', // Must be set
  FROM_NAME: 'NextSaaS',
  
  // Storage
  STORAGE_PROVIDER: 'aws-s3',
  AWS_REGION: 'us-east-1',
  
  // Billing
  STRIPE_SECRET_KEY: '', // Must be set
  STRIPE_WEBHOOK_SECRET: '', // Must be set
  
  // Cache
  REDIS_URL: '', // Recommended
  
  // Security
  ALLOWED_ORIGINS: 'https://app.nextsaas.com',
  RATE_LIMIT_MAX: '100',
  
  // Features
  ENABLE_API_DOCS: 'false',
  ENABLE_MULTI_TENANT: 'false',
  ENABLE_REAL_TIME: 'false',
  
  // Monitoring
  LOG_LEVEL: 'info',
  
  // Third-party
  SENTRY_DSN: '', // Recommended
  GA_MEASUREMENT_ID: '', // Recommended
};

// Production validation rules
export const productionValidationRules = {
  // Strict validation in production
  requireEmailValidation: true,
  requirePhoneValidation: true,
  disallowTestData: true,
  enforceRateLimit: true,
  requireSecurePasswords: true,
  requireCaptcha: true,
  
  // Security requirements
  requireHttps: true,
  enforceCSP: true,
  validateOrigins: true,
  logSecurityEvents: true,
  
  // Performance requirements
  enableCaching: true,
  useConnectionPooling: true,
  enableCompression: true,
  optimizeImages: true,
};

export default productionConfig;