import { z } from 'zod';

/**
 * Monitoring Configuration Schema
 * 
 * Validates monitoring and observability settings including:
 * - Application performance monitoring (APM)
 * - Error tracking and logging
 * - Health checks and uptime monitoring
 * - Metrics collection and alerting
 * - Performance monitoring
 * - Security monitoring
 */

// Log level enum
export const LogLevel = z.enum(['error', 'warn', 'info', 'debug', 'trace']);

// Logging configuration
const loggingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  level: LogLevel.default('info'),
  
  // Console logging
  console: z.object({
    enabled: z.boolean().default(true),
    colorize: z.boolean().default(true),
    timestamp: z.boolean().default(true),
    format: z.enum(['json', 'simple', 'combined']).default('simple'),
  }).default({}),
  
  // File logging
  file: z.object({
    enabled: z.boolean().default(false),
    filename: z.string().default('./logs/app.log'),
    maxsize: z.number().int().min(1024).default(10485760), // 10MB
    maxFiles: z.number().int().min(1).default(5),
    datePattern: z.string().default('YYYY-MM-DD'),
    zippedArchive: z.boolean().default(true),
  }).default({}),
  
  // Remote logging
  remote: z.object({
    enabled: z.boolean().default(false),
    transport: z.enum(['http', 'tcp', 'udp']).default('http'),
    endpoint: z.string().url().optional(),
    apiKey: z.string().optional(),
    timeout: z.number().int().min(1000).default(10000),
    retries: z.number().int().min(0).default(3),
  }).default({}),
  
  // Structured logging
  structured: z.object({
    enabled: z.boolean().default(true),
    includeStackTrace: z.boolean().default(true),
    includeUserAgent: z.boolean().default(false),
    includeRequestId: z.boolean().default(true),
    includePII: z.boolean().default(false),
  }).default({}),
  
  // Log retention
  retention: z.object({
    days: z.number().int().min(1).default(30),
    maxSizeGB: z.number().min(0.1).default(10),
    compression: z.boolean().default(true),
  }).default({}),
}).describe('Application logging configuration');

// Error tracking configuration
const errorTrackingSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Error reporting
  reporting: z.object({
    enabled: z.boolean().default(true),
    includeStackTrace: z.boolean().default(true),
    includeSourceCode: z.boolean().default(false),
    includeRequestData: z.boolean().default(true),
    includeUserData: z.boolean().default(false),
    maxBreadcrumbs: z.number().int().min(0).default(100),
  }).default({}),
  
  // Error grouping
  grouping: z.object({
    enabled: z.boolean().default(true),
    algorithm: z.enum(['stack-trace', 'message', 'custom']).default('stack-trace'),
    maxGroupSize: z.number().int().min(1).default(1000),
  }).default({}),
  
  // Error filtering
  filtering: z.object({
    enabled: z.boolean().default(true),
    ignorePatterns: z.array(z.string()).default([
      'Non-Error promise rejection captured',
      'Script error.',
      'Network request failed',
    ]),
    ignoreDomains: z.array(z.string()).default([
      'extensions',
      'chrome-extension',
    ]),
    ignoreUrls: z.array(z.string()).default([]),
    sampleRate: z.number().min(0).max(1).default(1.0),
  }).default({}),
  
  // Notifications
  notifications: z.object({
    enabled: z.boolean().default(true),
    channels: z.array(z.enum(['email', 'slack', 'webhook'])).default(['email']),
    threshold: z.number().int().min(1).default(10),
    timeWindow: z.number().int().min(60).default(300), // 5 minutes
    cooldown: z.number().int().min(60).default(3600), // 1 hour
  }).default({}),
}).describe('Error tracking and reporting configuration');

// Performance monitoring configuration
const performanceMonitoringSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Web vitals tracking
  webVitals: z.object({
    enabled: z.boolean().default(true),
    trackLCP: z.boolean().default(true), // Largest Contentful Paint
    trackFID: z.boolean().default(true), // First Input Delay
    trackCLS: z.boolean().default(true), // Cumulative Layout Shift
    trackFCP: z.boolean().default(true), // First Contentful Paint
    trackTTFB: z.boolean().default(true), // Time to First Byte
  }).default({}),
  
  // API performance monitoring
  api: z.object({
    enabled: z.boolean().default(true),
    trackResponseTimes: z.boolean().default(true),
    trackThroughput: z.boolean().default(true),
    trackErrorRates: z.boolean().default(true),
    slowRequestThreshold: z.number().int().min(100).default(1000), // 1 second
    sampleRate: z.number().min(0).max(1).default(0.1),
  }).default({}),
  
  // Database performance monitoring
  database: z.object({
    enabled: z.boolean().default(true),
    trackQueryTime: z.boolean().default(true),
    trackSlowQueries: z.boolean().default(true),
    slowQueryThreshold: z.number().int().min(100).default(1000),
    trackConnectionPool: z.boolean().default(true),
  }).default({}),
  
  // Memory and CPU monitoring
  system: z.object({
    enabled: z.boolean().default(true),
    trackMemoryUsage: z.boolean().default(true),
    trackCpuUsage: z.boolean().default(true),
    trackDiskUsage: z.boolean().default(false),
    trackNetworkUsage: z.boolean().default(false),
    sampleInterval: z.number().int().min(1000).default(60000), // 1 minute
  }).default({}),
}).describe('Performance monitoring configuration');

// Health checks configuration
const healthChecksSchema = z.object({
  enabled: z.boolean().default(true),
  endpoint: z.string().default('/health'),
  interval: z.number().int().min(1000).default(30000), // 30 seconds
  timeout: z.number().int().min(1000).default(5000),
  
  // Health check types
  checks: z.object({
    database: z.object({
      enabled: z.boolean().default(true),
      timeout: z.number().int().min(1000).default(5000),
      critical: z.boolean().default(true),
    }).default({}),
    
    redis: z.object({
      enabled: z.boolean().default(false),
      timeout: z.number().int().min(1000).default(2000),
      critical: z.boolean().default(false),
    }).default({}),
    
    email: z.object({
      enabled: z.boolean().default(false),
      timeout: z.number().int().min(1000).default(10000),
      critical: z.boolean().default(false),
    }).default({}),
    
    storage: z.object({
      enabled: z.boolean().default(false),
      timeout: z.number().int().min(1000).default(5000),
      critical: z.boolean().default(false),
    }).default({}),
    
    externalServices: z.object({
      enabled: z.boolean().default(false),
      services: z.array(z.object({
        name: z.string(),
        url: z.string().url(),
        timeout: z.number().int().min(1000).default(5000),
        critical: z.boolean().default(false),
      })).default([]),
    }).default({}),
  }).default({}),
  
  // Health check responses
  responses: z.object({
    healthy: z.object({
      status: z.number().int().default(200),
      message: z.string().default('OK'),
    }).default({}),
    unhealthy: z.object({
      status: z.number().int().default(503),
      message: z.string().default('Service Unavailable'),
    }).default({}),
  }).default({}),
}).describe('Health checks configuration');

// Metrics collection configuration
const metricsCollectionSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Metrics providers
  providers: z.object({
    prometheus: z.object({
      enabled: z.boolean().default(false),
      endpoint: z.string().default('/metrics'),
      port: z.number().int().min(1).max(65535).optional(),
      collectDefaultMetrics: z.boolean().default(true),
      gcMetrics: z.boolean().default(true),
    }).default({}),
    
    statsd: z.object({
      enabled: z.boolean().default(false),
      host: z.string().default('localhost'),
      port: z.number().int().min(1).max(65535).default(8125),
      prefix: z.string().default('nextsaas.'),
      sampleRate: z.number().min(0).max(1).default(1.0),
    }).default({}),
    
    cloudwatch: z.object({
      enabled: z.boolean().default(false),
      namespace: z.string().default('NextSaaS'),
      region: z.string().default('us-east-1'),
      dimensions: z.record(z.string(), z.string()).default({}),
    }).default({}),
  }).default({}),
  
  // Custom metrics
  custom: z.object({
    enabled: z.boolean().default(true),
    business: z.object({
      trackSignups: z.boolean().default(true),
      trackLogins: z.boolean().default(true),
      trackPayments: z.boolean().default(true),
      trackApiUsage: z.boolean().default(true),
    }).default({}),
    
    technical: z.object({
      trackRequestRate: z.boolean().default(true),
      trackErrorRate: z.boolean().default(true),
      trackResponseTime: z.boolean().default(true),
      trackThroughput: z.boolean().default(true),
    }).default({}),
  }).default({}),
  
  // Metrics retention
  retention: z.object({
    highResolution: z.number().int().min(1).default(24), // hours
    mediumResolution: z.number().int().min(1).default(7), // days
    lowResolution: z.number().int().min(1).default(90), // days
  }).default({}),
}).describe('Metrics collection configuration');

// Alerting configuration
const alertingSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Alert rules
  rules: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    condition: z.string(),
    threshold: z.number(),
    severity: z.enum(['critical', 'warning', 'info']),
    enabled: z.boolean().default(true),
    
    // Alert actions
    actions: z.array(z.object({
      type: z.enum(['email', 'slack', 'webhook', 'sms']),
      target: z.string(),
      template: z.string().optional(),
    })),
    
    // Alert timing
    evaluationInterval: z.number().int().min(60).default(300), // 5 minutes
    cooldown: z.number().int().min(60).default(1800), // 30 minutes
  })).default([]),
  
  // Default alert channels
  channels: z.object({
    email: z.object({
      enabled: z.boolean().default(true),
      recipients: z.array(z.string().email()).default([]),
      template: z.string().default('alert'),
    }).default({}),
    
    slack: z.object({
      enabled: z.boolean().default(false),
      webhookUrl: z.string().url().optional(),
      channel: z.string().optional(),
      username: z.string().default('NextSaaS Alerts'),
    }).default({}),
    
    webhook: z.object({
      enabled: z.boolean().default(false),
      url: z.string().url().optional(),
      headers: z.record(z.string(), z.string()).default({}),
      timeout: z.number().int().min(1000).default(10000),
    }).default({}),
  }).default({}),
}).describe('Alerting and notification configuration');

// Security monitoring configuration
const securityMonitoringSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Authentication monitoring
  authentication: z.object({
    trackFailedLogins: z.boolean().default(true),
    trackSuspiciousActivity: z.boolean().default(true),
    bruteForceThreshold: z.number().int().min(1).default(5),
    timeWindow: z.number().int().min(60).default(300), // 5 minutes
  }).default({}),
  
  // Rate limiting monitoring
  rateLimiting: z.object({
    trackViolations: z.boolean().default(true),
    trackSourceIPs: z.boolean().default(true),
    blockThreshold: z.number().int().min(1).default(100),
    timeWindow: z.number().int().min(60).default(3600), // 1 hour
  }).default({}),
  
  // Data access monitoring
  dataAccess: z.object({
    trackSensitiveData: z.boolean().default(true),
    trackExports: z.boolean().default(true),
    trackDeletes: z.boolean().default(true),
    trackAdminActions: z.boolean().default(true),
  }).default({}),
  
  // Security alerts
  alerts: z.object({
    enabled: z.boolean().default(true),
    channels: z.array(z.enum(['email', 'slack', 'webhook'])).default(['email']),
    threshold: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  }).default({}),
}).describe('Security monitoring configuration');

// Main monitoring configuration schema
export const monitoringConfigSchema = z.object({
  // Global monitoring settings
  enabled: z.boolean().default(true),
  environment: z.string().default('production'),
  
  // Logging configuration
  logging: loggingConfigSchema.default({}),
  
  // Error tracking
  errorTracking: errorTrackingSchema.default({}),
  
  // Performance monitoring
  performance: performanceMonitoringSchema.default({}),
  
  // Health checks
  healthChecks: healthChecksSchema.default({}),
  
  // Metrics collection
  metrics: metricsCollectionSchema.default({}),
  
  // Alerting
  alerting: alertingSchema.default({}),
  
  // Security monitoring
  security: securityMonitoringSchema.default({}),
  
  // Sampling and data collection
  sampling: z.object({
    enabled: z.boolean().default(true),
    errorRate: z.number().min(0).max(1).default(1.0),
    performanceRate: z.number().min(0).max(1).default(0.1),
    logRate: z.number().min(0).max(1).default(1.0),
  }).default({}),
  
  // Data privacy and compliance
  privacy: z.object({
    enabled: z.boolean().default(true),
    anonymizeIPs: z.boolean().default(true),
    excludePII: z.boolean().default(true),
    dataRetentionDays: z.number().int().min(1).default(90),
    encryptLogs: z.boolean().default(false),
  }).default({}),
  
}).describe('Monitoring and observability configuration');

// Export types
export type MonitoringConfig = z.infer<typeof monitoringConfigSchema>;
export type LogLevel = z.infer<typeof LogLevel>;
export type LoggingConfig = z.infer<typeof loggingConfigSchema>;

// Environment-specific monitoring configurations
export const developmentMonitoringDefaults: Partial<MonitoringConfig> = {
  enabled: true,
  environment: 'development',
  logging: {
    enabled: true,
    level: 'debug',
    console: {
      enabled: true,
      colorize: true,
      format: 'simple',
    },
    file: {
      enabled: false,
    },
    remote: {
      enabled: false,
    },
  },
  errorTracking: {
    enabled: true,
    reporting: {
      includeSourceCode: true,
      includeRequestData: true,
    },
    filtering: {
      sampleRate: 1.0,
    },
    notifications: {
      enabled: false,
    },
  },
  performance: {
    enabled: true,
    api: {
      sampleRate: 1.0,
    },
  },
  healthChecks: {
    enabled: true,
    interval: 30000,
    checks: {
      database: {
        enabled: true,
        critical: true,
      },
    },
  },
  metrics: {
    enabled: true,
    providers: {
      prometheus: {
        enabled: false,
      },
    },
  },
  alerting: {
    enabled: false,
  },
  security: {
    enabled: true,
    alerts: {
      enabled: false,
    },
  },
  sampling: {
    errorRate: 1.0,
    performanceRate: 1.0,
    logRate: 1.0,
  },
};

export const productionMonitoringDefaults: Partial<MonitoringConfig> = {
  enabled: true,
  environment: 'production',
  logging: {
    enabled: true,
    level: 'info',
    console: {
      enabled: false,
    },
    file: {
      enabled: true,
      maxsize: 52428800, // 50MB
      maxFiles: 10,
    },
    remote: {
      enabled: true,
    },
    retention: {
      days: 90,
      maxSizeGB: 100,
    },
  },
  errorTracking: {
    enabled: true,
    reporting: {
      includeSourceCode: false,
      includeRequestData: false,
    },
    filtering: {
      sampleRate: 0.1,
    },
    notifications: {
      enabled: true,
      channels: ['email', 'slack'],
      threshold: 5,
    },
  },
  performance: {
    enabled: true,
    api: {
      sampleRate: 0.01,
    },
  },
  healthChecks: {
    enabled: true,
    interval: 60000,
    checks: {
      database: {
        enabled: true,
        critical: true,
      },
      redis: {
        enabled: true,
        critical: false,
      },
      email: {
        enabled: true,
        critical: false,
      },
    },
  },
  metrics: {
    enabled: true,
    providers: {
      prometheus: {
        enabled: true,
      },
      cloudwatch: {
        enabled: true,
      },
    },
    retention: {
      highResolution: 24,
      mediumResolution: 30,
      lowResolution: 365,
    },
  },
  alerting: {
    enabled: true,
    channels: {
      email: {
        enabled: true,
      },
      slack: {
        enabled: true,
      },
    },
  },
  security: {
    enabled: true,
    alerts: {
      enabled: true,
      channels: ['email', 'slack'],
      threshold: 'medium',
    },
  },
  sampling: {
    errorRate: 1.0,
    performanceRate: 0.01,
    logRate: 0.1,
  },
  privacy: {
    enabled: true,
    anonymizeIPs: true,
    excludePII: true,
    dataRetentionDays: 90,
    encryptLogs: true,
  },
};

export const testMonitoringDefaults: Partial<MonitoringConfig> = {
  enabled: false,
  environment: 'test',
  logging: {
    enabled: false,
  },
  errorTracking: {
    enabled: false,
  },
  performance: {
    enabled: false,
  },
  healthChecks: {
    enabled: false,
  },
  metrics: {
    enabled: false,
  },
  alerting: {
    enabled: false,
  },
  security: {
    enabled: false,
  },
};