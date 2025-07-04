import { z } from 'zod';
import { baseConfigSchema, type BaseConfig } from './environments/base';
import { developmentConfig, developmentEnvVars } from './environments/development';
import { stagingConfig, stagingEnvVars, stagingRequiredEnvVars } from './environments/staging';
import { productionConfig, productionEnvVars, productionRequiredEnvVars } from './environments/production';
import { testConfig, testEnvVars, testRequiredEnvVars } from './environments/test';

/**
 * Configuration Loader and Validation System
 * 
 * This module provides:
 * - Environment-specific configuration loading
 * - Runtime validation using Zod schemas
 * - Environment variable parsing and validation
 * - Configuration merging and inheritance
 * - Type-safe configuration access
 * - Error handling and validation reporting
 */

// Environment type
export type Environment = 'development' | 'staging' | 'production' | 'test';

// Configuration load result
export interface ConfigLoadResult {
  config: BaseConfig;
  environment: Environment;
  validationErrors: string[];
  missingEnvVars: string[];
  warnings: string[];
}

// Configuration loader options
export interface ConfigLoaderOptions {
  environment?: Environment;
  envVars?: Record<string, string>;
  strict?: boolean;
  validate?: boolean;
  throwOnError?: boolean;
  mergeWithDefaults?: boolean;
}

// Configuration cache
let configCache: Map<Environment, BaseConfig> = new Map();
let isInitialized = false;

/**
 * Get the current environment
 */
export function getCurrentEnvironment(): Environment {
  const env = process.env.NODE_ENV as Environment;
  if (['development', 'staging', 'production', 'test'].includes(env)) {
    return env;
  }
  return 'development'; // Default fallback
}

/**
 * Get environment-specific configuration
 */
function getEnvironmentConfig(environment: Environment): Partial<BaseConfig> {
  switch (environment) {
    case 'development':
      return developmentConfig;
    case 'staging':
      return stagingConfig;
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}

/**
 * Get environment-specific default environment variables
 */
function getEnvironmentDefaults(environment: Environment): Record<string, string> {
  switch (environment) {
    case 'development':
      return developmentEnvVars;
    case 'staging':
      return stagingEnvVars;
    case 'production':
      return productionEnvVars;
    case 'test':
      return testEnvVars;
    default:
      return {};
  }
}

/**
 * Get environment-specific required environment variables
 */
function getRequiredEnvVars(environment: Environment): string[] {
  switch (environment) {
    case 'development':
      return []; // No required vars for development
    case 'staging':
      return stagingRequiredEnvVars;
    case 'production':
      return productionRequiredEnvVars;
    case 'test':
      return testRequiredEnvVars;
    default:
      return [];
  }
}

/**
 * Parse environment variables with type coercion
 */
function parseEnvVars(envVars: Record<string, string>): Record<string, any> {
  const parsed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(envVars)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    const stringValue = String(value);
    
    // Boolean parsing
    if (stringValue.toLowerCase() === 'true') {
      parsed[key] = true;
    } else if (stringValue.toLowerCase() === 'false') {
      parsed[key] = false;
    } 
    // Number parsing
    else if (/^\d+$/.test(stringValue)) {
      parsed[key] = parseInt(stringValue, 10);
    } else if (/^\d+\.\d+$/.test(stringValue)) {
      parsed[key] = parseFloat(stringValue);
    }
    // Array parsing (comma-separated)
    else if (stringValue.includes(',')) {
      parsed[key] = stringValue.split(',').map(s => s.trim());
    }
    // JSON parsing
    else if (stringValue.startsWith('{') || stringValue.startsWith('[')) {
      try {
        parsed[key] = JSON.parse(stringValue);
      } catch {
        parsed[key] = stringValue;
      }
    }
    // String value
    else {
      parsed[key] = stringValue;
    }
  }
  
  return parsed;
}

/**
 * Validate required environment variables
 */
function validateRequiredEnvVars(environment: Environment, envVars: Record<string, string>): string[] {
  const required = getRequiredEnvVars(environment);
  const missing: string[] = [];
  
  for (const envVar of required) {
    if (!envVars[envVar] || envVars[envVar].trim() === '') {
      missing.push(envVar);
    }
  }
  
  return missing;
}

/**
 * Deep merge configuration objects
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== undefined) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        if (typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
          result[key] = deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Map environment variables to configuration structure
 */
function mapEnvVarsToConfig(envVars: Record<string, any>): Partial<BaseConfig> {
  const config: Partial<BaseConfig> = {};
  
  // Map common environment variables to config structure
  const mappings: Record<string, string> = {
    // App
    'APP_NAME': 'app.name',
    'APP_VERSION': 'app.version',
    'APP_DESCRIPTION': 'app.description',
    'APP_URL': 'app.url',
    'API_URL': 'app.apiUrl',
    'SUPPORT_EMAIL': 'app.supportEmail',
    'ADMIN_EMAIL': 'app.adminEmail',
    'COMPANY_NAME': 'app.companyName',
    
    // Environment
    'NODE_ENV': 'env.NODE_ENV',
    'DEBUG': 'env.DEBUG',
    'LOG_LEVEL': 'env.LOG_LEVEL',
    'PORT': 'env.PORT',
    'HOST': 'env.HOST',
    'TIMEZONE': 'env.TIMEZONE',
    
    // Database
    'DATABASE_URL': 'database.url',
    'DB_POOL_MIN': 'database.pool.min',
    'DB_POOL_MAX': 'database.pool.max',
    
    // Authentication
    'JWT_SECRET': 'auth.jwt.secret',
    'JWT_EXPIRES_IN': 'auth.jwt.expiresIn',
    'SESSION_SECRET': 'auth.session.secret',
    'SESSION_MAX_AGE': 'auth.session.maxAge',
    
    // Email
    'EMAIL_PROVIDER': 'email.provider',
    'FROM_EMAIL': 'email.sender.email',
    'FROM_NAME': 'email.sender.name',
    'SMTP_HOST': 'email.smtp.host',
    'SMTP_PORT': 'email.smtp.port',
    'SENDGRID_API_KEY': 'email.sendgrid.apiKey',
    
    // Storage
    'STORAGE_PROVIDER': 'storage.provider',
    'AWS_ACCESS_KEY_ID': 'storage.awsS3.accessKeyId',
    'AWS_SECRET_ACCESS_KEY': 'storage.awsS3.secretAccessKey',
    'AWS_REGION': 'storage.awsS3.region',
    'S3_BUCKET': 'storage.awsS3.bucket',
    
    // Billing
    'STRIPE_PUBLISHABLE_KEY': 'billing.stripe.publishableKey',
    'STRIPE_SECRET_KEY': 'billing.stripe.secretKey',
    'STRIPE_WEBHOOK_SECRET': 'billing.stripe.webhookSecret',
    
    // Redis
    'REDIS_URL': 'cache.redis.url',
    'REDIS_HOST': 'cache.redis.host',
    'REDIS_PORT': 'cache.redis.port',
    'REDIS_PASSWORD': 'cache.redis.password',
    'REDIS_DB': 'cache.redis.db',
  };
  
  // Apply mappings
  for (const [envVar, configPath] of Object.entries(mappings)) {
    if (envVars[envVar] !== undefined) {
      setNestedValue(config, configPath, envVars[envVar]);
    }
  }
  
  return config;
}

/**
 * Set nested value in object using dot notation
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Load and validate configuration
 */
export async function loadConfig(options: ConfigLoaderOptions = {}): Promise<ConfigLoadResult> {
  const {
    environment = getCurrentEnvironment(),
    envVars = process.env,
    strict = true,
    validate = true,
    throwOnError = false,
    mergeWithDefaults = true,
  } = options;
  
  const result: ConfigLoadResult = {
    config: {} as BaseConfig,
    environment,
    validationErrors: [],
    missingEnvVars: [],
    warnings: [],
  };
  
  try {
    // Check cache first
    if (configCache.has(environment)) {
      result.config = configCache.get(environment)!;
      return result;
    }
    
    // Get environment-specific configuration
    const envConfig = getEnvironmentConfig(environment);
    
    // Get environment defaults
    const envDefaults = getEnvironmentDefaults(environment);
    
    // Merge environment variables with defaults
    const mergedEnvVars = { ...envDefaults, ...envVars };
    
    // Validate required environment variables
    result.missingEnvVars = validateRequiredEnvVars(environment, mergedEnvVars);
    
    if (result.missingEnvVars.length > 0) {
      const error = `Missing required environment variables: ${result.missingEnvVars.join(', ')}`;
      result.validationErrors.push(error);
      
      if (throwOnError) {
        throw new Error(error);
      }
    }
    
    // Parse environment variables
    const parsedEnvVars = parseEnvVars(mergedEnvVars);
    
    // Map environment variables to configuration structure
    const envMappedConfig = mapEnvVarsToConfig(parsedEnvVars);
    
    // Merge configurations
    let finalConfig = envConfig;
    
    if (mergeWithDefaults) {
      finalConfig = deepMerge(envConfig, envMappedConfig);
    }
    
    // Validate configuration if requested
    if (validate) {
      try {
        const validatedConfig = baseConfigSchema.parse(finalConfig);
        result.config = validatedConfig;
      } catch (error) {
        if (error instanceof z.ZodError) {
          result.validationErrors = error.errors.map(
            (err) => `${err.path.join('.')}: ${err.message}`
          );
        } else {
          result.validationErrors.push(`Validation error: ${error}`);
        }
        
        if (throwOnError) {
          throw new Error(`Configuration validation failed: ${result.validationErrors.join(', ')}`);
        }
        
        // Use unvalidated config if validation fails but throwOnError is false
        result.config = finalConfig as BaseConfig;
      }
    } else {
      result.config = finalConfig as BaseConfig;
    }
    
    // Cache the configuration
    configCache.set(environment, result.config);
    
    // Add warnings for non-strict mode
    if (!strict && result.validationErrors.length > 0) {
      result.warnings.push(
        `Configuration validation failed but running in non-strict mode: ${result.validationErrors.join(', ')}`
      );
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.validationErrors.push(errorMessage);
    
    if (throwOnError) {
      throw error;
    }
    
    return result;
  }
}

/**
 * Get configuration synchronously (must be initialized first)
 */
export function getConfig(environment?: Environment): BaseConfig {
  const env = environment || getCurrentEnvironment();
  
  if (!isInitialized) {
    throw new Error('Configuration not initialized. Call initializeConfig() first.');
  }
  
  const config = configCache.get(env);
  if (!config) {
    throw new Error(`Configuration not loaded for environment: ${env}`);
  }
  
  return config;
}

/**
 * Initialize configuration asynchronously
 */
export async function initializeConfig(options: ConfigLoaderOptions = {}): Promise<BaseConfig> {
  const result = await loadConfig(options);
  
  if (result.validationErrors.length > 0) {
    console.error('Configuration validation errors:', result.validationErrors);
  }
  
  if (result.missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', result.missingEnvVars);
  }
  
  if (result.warnings.length > 0) {
    console.warn('Configuration warnings:', result.warnings);
  }
  
  isInitialized = true;
  return result.config;
}

/**
 * Validate configuration without loading
 */
export async function validateConfig(config: unknown): Promise<{
  valid: boolean;
  errors: string[];
  data?: BaseConfig;
}> {
  try {
    const validatedConfig = baseConfigSchema.parse(config);
    return {
      valid: true,
      errors: [],
      data: validatedConfig,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ),
      };
    }
    
    return {
      valid: false,
      errors: [`Validation error: ${error}`],
    };
  }
}

/**
 * Clear configuration cache
 */
export function clearConfigCache(): void {
  configCache.clear();
  isInitialized = false;
}

/**
 * Get configuration schema for validation
 */
export function getConfigSchema(): z.ZodSchema<BaseConfig> {
  return baseConfigSchema;
}

/**
 * Check if configuration is initialized
 */
export function isConfigInitialized(): boolean {
  return isInitialized;
}

/**
 * Export configuration for environment
 */
export async function exportConfig(environment: Environment, format: 'json' | 'yaml' | 'env' = 'json'): Promise<string> {
  const result = await loadConfig({ environment });
  
  switch (format) {
    case 'json':
      return JSON.stringify(result.config, null, 2);
    case 'yaml':
      // Would need yaml library for this
      throw new Error('YAML export not implemented yet');
    case 'env':
      return Object.entries(getEnvironmentDefaults(environment))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

// Export types and utilities
export type {
  BaseConfig,
  ConfigLoaderOptions,
  ConfigLoadResult,
};