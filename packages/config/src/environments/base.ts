import { z } from 'zod';
import {
  authConfigSchema,
  billingConfigSchema,
  databaseConfigSchema,
  emailConfigSchema,
  integrationsConfigSchema,
  monitoringConfigSchema,
  storageConfigSchema,
} from '../schemas';

/**
 * Base Configuration Schema
 * 
 * This is the master configuration schema that combines all individual service schemas.
 * It serves as the foundation for all environment-specific configurations.
 */

// Application metadata schema
const appMetadataSchema = z.object({
  name: z.string().default('NextSaaS'),
  version: z.string().default('1.0.0'),
  description: z.string().default('NextSaaS - Open Source SaaS Starter'),
  url: z.string().url().default('http://localhost:3000'),
  apiUrl: z.string().url().default('http://localhost:3000/api'),
  supportEmail: z.string().email().default('support@nextsaas.com'),
  adminEmail: z.string().email().default('admin@nextsaas.com'),
  companyName: z.string().default('NextSaaS Inc.'),
}).describe('Application metadata and basic information');

// Environment configuration
const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  DEBUG: z.boolean().default(false),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
  PORT: z.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default('localhost'),
  TIMEZONE: z.string().default('UTC'),
}).describe('Environment and runtime configuration');

// Feature flags schema
const featureFlagsSchema = z.object({
  // Core features
  authentication: z.boolean().default(true),
  billing: z.boolean().default(true),
  subscriptions: z.boolean().default(true),
  fileUploads: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  
  // Advanced features
  multiTenant: z.boolean().default(false),
  apiRateLimiting: z.boolean().default(true),
  advancedAnalytics: z.boolean().default(false),
  realTimeFeatures: z.boolean().default(false),
  webhookSupport: z.boolean().default(true),
  
  // Beta features
  aiIntegration: z.boolean().default(false),
  advancedReporting: z.boolean().default(false),
  customDomains: z.boolean().default(false),
  whiteLabeling: z.boolean().default(false),
  
  // Development features
  debugMode: z.boolean().default(false),
  performanceTracking: z.boolean().default(true),
  errorReporting: z.boolean().default(true),
  metricsCollection: z.boolean().default(true),
}).describe('Feature flags for enabling/disabling functionality');

// Security configuration
const securityConfigSchema = z.object({
  // CORS settings
  cors: z.object({
    enabled: z.boolean().default(true),
    origin: z.union([
      z.string(),
      z.array(z.string()),
      z.boolean(),
    ]).default(['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']),
    credentials: z.boolean().default(true),
    methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']),
    allowedHeaders: z.array(z.string()).default(['Content-Type', 'Authorization']),
  }).default({}),
  
  // Rate limiting
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    windowMs: z.number().int().min(1000).default(900000), // 15 minutes
    maxRequests: z.number().int().min(1).default(100),
    skipSuccessfulRequests: z.boolean().default(false),
    skipFailedRequests: z.boolean().default(false),
  }).default({}),
  
  // Content Security Policy
  csp: z.object({
    enabled: z.boolean().default(true),
    directives: z.record(z.string(), z.array(z.string())).default({
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }),
  }).default({}),
  
  // HTTPS settings
  https: z.object({
    enforced: z.boolean().default(false),
    hsts: z.object({
      enabled: z.boolean().default(false),
      maxAge: z.number().int().min(0).default(31536000), // 1 year
      includeSubDomains: z.boolean().default(true),
      preload: z.boolean().default(false),
    }).default({}),
  }).default({}),
  
  // API security
  api: z.object({
    keyRotation: z.boolean().default(false),
    requestSigning: z.boolean().default(false),
    ipWhitelist: z.array(z.string()).default([]),
    maxPayloadSize: z.string().default('10mb'),
  }).default({}),
}).describe('Application security configuration');

// Cache configuration
const cacheConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Default cache settings
  defaultTtl: z.number().int().min(0).default(3600), // 1 hour
  
  // Memory cache
  memory: z.object({
    enabled: z.boolean().default(true),
    maxSize: z.number().int().min(1).default(1000),
    ttl: z.number().int().min(0).default(3600),
  }).default({}),
  
  // Redis cache
  redis: z.object({
    enabled: z.boolean().default(false),
    url: z.string().optional(),
    host: z.string().default('localhost'),
    port: z.number().int().min(1).max(65535).default(6379),
    password: z.string().optional(),
    db: z.number().int().min(0).default(0),
    keyPrefix: z.string().default('nextsaas:cache:'),
    ttl: z.number().int().min(0).default(3600),
  }).default({}),
  
  // Cache strategies
  strategies: z.object({
    api: z.enum(['memory', 'redis', 'hybrid']).default('memory'),
    database: z.enum(['memory', 'redis', 'hybrid']).default('memory'),
    sessions: z.enum(['memory', 'redis']).default('memory'),
    static: z.enum(['memory', 'redis', 'cdn']).default('memory'),
  }).default({}),
}).describe('Caching configuration');

// API configuration
const apiConfigSchema = z.object({
  // API versioning
  versioning: z.object({
    enabled: z.boolean().default(true),
    strategy: z.enum(['url', 'header', 'query']).default('url'),
    defaultVersion: z.string().default('v1'),
    supportedVersions: z.array(z.string()).default(['v1']),
    deprecationNotice: z.boolean().default(true),
  }).default({}),
  
  // API documentation
  documentation: z.object({
    enabled: z.boolean().default(true),
    path: z.string().default('/api/docs'),
    ui: z.enum(['swagger', 'redoc', 'rapidoc']).default('swagger'),
    openapi: z.object({
      version: z.string().default('3.0.0'),
      title: z.string().default('NextSaaS API'),
      description: z.string().default('NextSaaS API Documentation'),
    }).default({}),
  }).default({}),
  
  // API pagination
  pagination: z.object({
    enabled: z.boolean().default(true),
    defaultLimit: z.number().int().min(1).default(25),
    maxLimit: z.number().int().min(1).default(100),
    strategy: z.enum(['offset', 'cursor']).default('offset'),
  }).default({}),
  
  // API response formatting
  response: z.object({
    envelope: z.boolean().default(true),
    timestamping: z.boolean().default(true),
    requestId: z.boolean().default(true),
    camelCase: z.boolean().default(true),
  }).default({}),
}).describe('API configuration and settings');

// Main base configuration schema
export const baseConfigSchema = z.object({
  // Application metadata
  app: appMetadataSchema.default({}),
  
  // Environment configuration
  env: environmentSchema.default({}),
  
  // Feature flags
  features: featureFlagsSchema.default({}),
  
  // Security configuration
  security: securityConfigSchema.default({}),
  
  // Cache configuration
  cache: cacheConfigSchema.default({}),
  
  // API configuration
  api: apiConfigSchema.default({}),
  
  // Service configurations
  database: databaseConfigSchema,
  auth: authConfigSchema,
  email: emailConfigSchema,
  storage: storageConfigSchema,
  billing: billingConfigSchema,
  integrations: integrationsConfigSchema,
  monitoring: monitoringConfigSchema,
  
}).describe('Complete NextSaaS application configuration');

// Export types
export type BaseConfig = z.infer<typeof baseConfigSchema>;
export type AppMetadata = z.infer<typeof appMetadataSchema>;
export type EnvironmentConfig = z.infer<typeof environmentSchema>;
export type FeatureFlags = z.infer<typeof featureFlagsSchema>;
export type SecurityConfig = z.infer<typeof securityConfigSchema>;
export type CacheConfig = z.infer<typeof cacheConfigSchema>;
export type ApiConfig = z.infer<typeof apiConfigSchema>;

// Default configuration values
export const baseConfigDefaults: Partial<BaseConfig> = {
  app: {
    name: 'NextSaaS',
    version: '1.0.0',
    description: 'NextSaaS - Open Source SaaS Starter',
    url: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api',
    supportEmail: 'support@nextsaas.com',
    adminEmail: 'admin@nextsaas.com',
    companyName: 'NextSaaS Inc.',
  },
  env: {
    NODE_ENV: 'development',
    DEBUG: false,
    LOG_LEVEL: 'info',
    PORT: 3000,
    HOST: 'localhost',
    TIMEZONE: 'UTC',
  },
  features: {
    authentication: true,
    billing: true,
    subscriptions: true,
    fileUploads: true,
    emailNotifications: true,
    multiTenant: false,
    apiRateLimiting: true,
    advancedAnalytics: false,
    realTimeFeatures: false,
    webhookSupport: true,
    aiIntegration: false,
    advancedReporting: false,
    customDomains: false,
    whiteLabeling: false,
    debugMode: false,
    performanceTracking: true,
    errorReporting: true,
    metricsCollection: true,
  },
  security: {
    cors: {
      enabled: true,
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    rateLimit: {
      enabled: true,
      windowMs: 900000, // 15 minutes
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    csp: {
      enabled: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
      },
    },
    https: {
      enforced: false,
      hsts: {
        enabled: false,
        maxAge: 31536000,
        includeSubDomains: true,
        preload: false,
      },
    },
  },
  cache: {
    enabled: true,
    defaultTtl: 3600,
    memory: {
      enabled: true,
      maxSize: 1000,
      ttl: 3600,
    },
    redis: {
      enabled: false,
      host: 'localhost',
      port: 6379,
      db: 0,
      keyPrefix: 'nextsaas:',
      ttl: 3600,
    },
  },
  api: {
    versioning: {
      enabled: true,
      strategy: 'url',
      defaultVersion: 'v1',
      supportedVersions: ['v1'],
      deprecationNotice: true,
    },
    documentation: {
      enabled: true,
      path: '/api/docs',
      ui: 'swagger',
      openapi: {
        title: 'NextSaaS API',
        version: '1.0.0',
        description: 'NextSaaS API Documentation',
      },
    },
    pagination: {
      enabled: true,
      strategy: 'offset',
      defaultLimit: 25,
      maxLimit: 100,
    },
  },
};