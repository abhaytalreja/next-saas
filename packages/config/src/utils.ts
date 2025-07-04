import { z } from 'zod';
import { BaseConfig, Environment } from './loader';

/**
 * Configuration Utilities
 * 
 * This module provides utility functions for configuration management,
 * validation, transformation, and other common operations.
 */

// Environment variable validation schema
const envVarSchema = z.object({
  name: z.string().min(1),
  value: z.string().optional(),
  required: z.boolean().default(false),
  description: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'json']).default('string'),
  default: z.any().optional(),
  validation: z.function().optional(),
});

export type EnvVarDefinition = z.infer<typeof envVarSchema>;

/**
 * Validate environment variable value
 */
export function validateEnvVar(definition: EnvVarDefinition, value?: string): {
  valid: boolean;
  error?: string;
  parsedValue?: any;
} {
  // Check if required
  if (definition.required && (!value || value.trim() === '')) {
    return {
      valid: false,
      error: `Required environment variable ${definition.name} is missing`,
    };
  }

  // Use default if no value provided
  if (!value && definition.default !== undefined) {
    return {
      valid: true,
      parsedValue: definition.default,
    };
  }

  // Skip validation if no value and not required
  if (!value) {
    return { valid: true };
  }

  // Parse value based on type
  try {
    let parsedValue: any;

    switch (definition.type) {
      case 'string':
        parsedValue = value;
        break;
      case 'number':
        parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
          return {
            valid: false,
            error: `Environment variable ${definition.name} must be a valid number`,
          };
        }
        break;
      case 'boolean':
        if (value.toLowerCase() === 'true') {
          parsedValue = true;
        } else if (value.toLowerCase() === 'false') {
          parsedValue = false;
        } else {
          return {
            valid: false,
            error: `Environment variable ${definition.name} must be 'true' or 'false'`,
          };
        }
        break;
      case 'array':
        parsedValue = value.split(',').map(s => s.trim());
        break;
      case 'json':
        try {
          parsedValue = JSON.parse(value);
        } catch {
          return {
            valid: false,
            error: `Environment variable ${definition.name} must be valid JSON`,
          };
        }
        break;
      default:
        parsedValue = value;
    }

    // Run custom validation if provided
    if (definition.validation) {
      const customValidation = definition.validation(parsedValue);
      if (customValidation !== true) {
        return {
          valid: false,
          error: typeof customValidation === 'string' 
            ? customValidation 
            : `Environment variable ${definition.name} failed validation`,
        };
      }
    }

    return {
      valid: true,
      parsedValue,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to parse environment variable ${definition.name}: ${error}`,
    };
  }
}

/**
 * Validate multiple environment variables
 */
export function validateEnvVars(definitions: EnvVarDefinition[], envVars: Record<string, string> = process.env): {
  valid: boolean;
  errors: string[];
  parsedValues: Record<string, any>;
} {
  const errors: string[] = [];
  const parsedValues: Record<string, any> = {};

  for (const definition of definitions) {
    const result = validateEnvVar(definition, envVars[definition.name]);
    
    if (!result.valid) {
      errors.push(result.error!);
    } else if (result.parsedValue !== undefined) {
      parsedValues[definition.name] = result.parsedValue;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    parsedValues,
  };
}

/**
 * Generate environment variable definitions from configuration
 */
export function generateEnvVarDefinitions(environment: Environment): EnvVarDefinition[] {
  const definitions: EnvVarDefinition[] = [];

  // Common environment variables
  definitions.push(
    // Application
    { name: 'APP_NAME', type: 'string', description: 'Application name' },
    { name: 'APP_VERSION', type: 'string', description: 'Application version' },
    { name: 'APP_URL', type: 'string', required: environment === 'production', description: 'Application URL' },
    { name: 'API_URL', type: 'string', description: 'API base URL' },
    { name: 'SUPPORT_EMAIL', type: 'string', description: 'Support email address' },
    { name: 'ADMIN_EMAIL', type: 'string', description: 'Admin email address' },
    
    // Environment
    { name: 'NODE_ENV', type: 'string', required: true, description: 'Node environment' },
    { name: 'DEBUG', type: 'boolean', default: false, description: 'Enable debug mode' },
    { name: 'LOG_LEVEL', type: 'string', default: 'info', description: 'Logging level' },
    { name: 'PORT', type: 'number', default: 3000, description: 'Server port' },
    { name: 'HOST', type: 'string', default: 'localhost', description: 'Server host' },
    
    // Database
    { name: 'DATABASE_URL', type: 'string', required: environment !== 'test', description: 'Database connection URL' },
    { name: 'DB_POOL_MIN', type: 'number', description: 'Database connection pool minimum size' },
    { name: 'DB_POOL_MAX', type: 'number', description: 'Database connection pool maximum size' },
    
    // Authentication
    { name: 'JWT_SECRET', type: 'string', required: environment === 'production', description: 'JWT secret key' },
    { name: 'JWT_EXPIRES_IN', type: 'string', default: '24h', description: 'JWT expiration time' },
    { name: 'SESSION_SECRET', type: 'string', required: environment === 'production', description: 'Session secret key' },
    
    // Email
    { name: 'EMAIL_PROVIDER', type: 'string', description: 'Email service provider' },
    { name: 'FROM_EMAIL', type: 'string', description: 'Default sender email' },
    { name: 'FROM_NAME', type: 'string', description: 'Default sender name' },
    { name: 'SENDGRID_API_KEY', type: 'string', description: 'SendGrid API key' },
    
    // Storage
    { name: 'STORAGE_PROVIDER', type: 'string', description: 'Storage provider' },
    { name: 'AWS_ACCESS_KEY_ID', type: 'string', description: 'AWS access key ID' },
    { name: 'AWS_SECRET_ACCESS_KEY', type: 'string', description: 'AWS secret access key' },
    { name: 'AWS_REGION', type: 'string', description: 'AWS region' },
    { name: 'S3_BUCKET', type: 'string', description: 'S3 bucket name' },
    
    // Billing
    { name: 'STRIPE_PUBLISHABLE_KEY', type: 'string', description: 'Stripe publishable key' },
    { name: 'STRIPE_SECRET_KEY', type: 'string', description: 'Stripe secret key' },
    { name: 'STRIPE_WEBHOOK_SECRET', type: 'string', description: 'Stripe webhook secret' },
    
    // Cache
    { name: 'REDIS_URL', type: 'string', description: 'Redis connection URL' },
    { name: 'REDIS_HOST', type: 'string', description: 'Redis host' },
    { name: 'REDIS_PORT', type: 'number', description: 'Redis port' },
    { name: 'REDIS_PASSWORD', type: 'string', description: 'Redis password' },
    
    // Security
    { name: 'ALLOWED_ORIGINS', type: 'array', description: 'Allowed CORS origins' },
    { name: 'RATE_LIMIT_MAX', type: 'number', description: 'Rate limit maximum requests' },
    
    // Third-party
    { name: 'SENTRY_DSN', type: 'string', description: 'Sentry DSN for error tracking' },
    { name: 'GA_MEASUREMENT_ID', type: 'string', description: 'Google Analytics measurement ID' },
  );

  return definitions;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Sanitize configuration for logging (remove sensitive data)
 */
export function sanitizeConfig(config: BaseConfig): Partial<BaseConfig> {
  const sanitized = deepClone(config);
  
  // Remove sensitive fields
  const sensitiveFields = [
    'database.url',
    'database.password',
    'auth.jwt.secret',
    'auth.session.secret',
    'email.smtp.auth.pass',
    'email.sendgrid.apiKey',
    'email.mailgun.apiKey',
    'storage.awsS3.accessKeyId',
    'storage.awsS3.secretAccessKey',
    'billing.stripe.secretKey',
    'billing.stripe.webhookSecret',
    'cache.redis.password',
    'integrations.development.sentry.dsn',
  ];
  
  for (const field of sensitiveFields) {
    const keys = field.split('.');
    let current: any = sanitized;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]]) {
        current = current[keys[i]];
      } else {
        break;
      }
    }
    
    if (current && current[keys[keys.length - 1]]) {
      current[keys[keys.length - 1]] = '***REDACTED***';
    }
  }
  
  return sanitized;
}

/**
 * Get configuration summary
 */
export function getConfigSummary(config: BaseConfig): {
  environment: string;
  features: Record<string, boolean>;
  services: Record<string, string>;
  security: Record<string, boolean>;
} {
  return {
    environment: config.env.NODE_ENV,
    features: {
      authentication: config.features.authentication,
      billing: config.features.billing,
      subscriptions: config.features.subscriptions,
      fileUploads: config.features.fileUploads,
      emailNotifications: config.features.emailNotifications,
      multiTenant: config.features.multiTenant,
      apiRateLimiting: config.features.apiRateLimiting,
      advancedAnalytics: config.features.advancedAnalytics,
      realTimeFeatures: config.features.realTimeFeatures,
      webhookSupport: config.features.webhookSupport,
      aiIntegration: config.features.aiIntegration,
      advancedReporting: config.features.advancedReporting,
      customDomains: config.features.customDomains,
      whiteLabeling: config.features.whiteLabeling,
    },
    services: {
      database: config.database.provider,
      email: config.email.provider,
      storage: config.storage.provider,
      billing: config.billing.provider,
      cache: config.cache.redis.enabled ? 'redis' : 'memory',
    },
    security: {
      cors: config.security.cors.enabled,
      rateLimit: config.security.rateLimit.enabled,
      csp: config.security.csp.enabled,
      https: config.security.https.enforced,
    },
  };
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}


/**
 * Format configuration for display
 */
export function formatConfigForDisplay(config: BaseConfig): string {
  const sanitized = sanitizeConfig(config);
  return JSON.stringify(sanitized, null, 2);
}

/**
 * Compare two configurations
 */
export function compareConfigs(config1: BaseConfig, config2: BaseConfig): {
  differences: string[];
  added: string[];
  removed: string[];
  changed: string[];
} {
  const differences: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  
  // This is a simplified comparison - in practice, you'd want a more sophisticated diff
  const config1Str = JSON.stringify(config1, null, 2);
  const config2Str = JSON.stringify(config2, null, 2);
  
  if (config1Str !== config2Str) {
    differences.push('Configurations differ');
  }
  
  return {
    differences,
    added,
    removed,
    changed,
  };
}

/**
 * Export utilities for specific use cases
 */
export const configUtils = {
  validateEnvVar,
  validateEnvVars,
  generateEnvVarDefinitions,
  deepClone,
  isEmpty,
  sanitizeConfig,
  getConfigSummary,
  isValidUrl,
  isValidEmail,
  generateRandomString,
  formatConfigForDisplay,
  compareConfigs,
};

export default configUtils;