import { EventEmitter } from 'events';
import { z } from 'zod';
import { BaseConfig, baseConfigSchema } from './environments/base';
import { Environment, loadConfig, validateConfig, ConfigLoaderOptions, ConfigLoadResult } from './loader';
import { deepClone, sanitizeConfig } from './utils';

/**
 * Type-Safe Configuration Manager
 * 
 * This module provides a comprehensive configuration management system with:
 * - Type-safe configuration access
 * - Real-time configuration updates
 * - Configuration validation and caching
 * - Event-driven configuration changes
 * - Middleware support for configuration processing
 * - Observer pattern for configuration watching
 */

// Configuration change event
export interface ConfigChangeEvent {
  environment: Environment;
  oldConfig: BaseConfig | null;
  newConfig: BaseConfig;
  changes: string[];
  timestamp: Date;
}

// Configuration middleware function
export type ConfigMiddleware = (config: BaseConfig, environment: Environment) => BaseConfig | Promise<BaseConfig>;

// Configuration watcher function
export type ConfigWatcher = (event: ConfigChangeEvent) => void | Promise<void>;

// Configuration access options
export interface ConfigAccessOptions {
  validate?: boolean;
  useCache?: boolean;
  middleware?: ConfigMiddleware[];
  defaultValue?: any;
}

// Configuration section type mapping
export type ConfigSectionKey = keyof BaseConfig;
export type ConfigSection<K extends ConfigSectionKey> = BaseConfig[K];

/**
 * Type-safe configuration manager class
 */
export class ConfigManager extends EventEmitter {
  private config: BaseConfig | null = null;
  private environment: Environment;
  private cache: Map<string, any> = new Map();
  private middleware: ConfigMiddleware[] = [];
  private watchers: Set<ConfigWatcher> = new Set();
  private initialized = false;
  private validationSchema: z.ZodSchema<BaseConfig>;
  private lastLoadResult: ConfigLoadResult | null = null;

  constructor(environment?: Environment, options: ConfigLoaderOptions = {}) {
    super();
    this.environment = environment || (process.env.NODE_ENV as Environment) || 'development';
    this.validationSchema = baseConfigSchema;
    this.setMaxListeners(100); // Allow many listeners
  }

  /**
   * Initialize the configuration manager
   */
  async initialize(options: ConfigLoaderOptions = {}): Promise<BaseConfig> {
    try {
      const result = await loadConfig({
        environment: this.environment,
        ...options,
      });

      const oldConfig = this.config;
      this.config = result.config;
      this.lastLoadResult = result;
      this.initialized = true;

      // Apply middleware
      if (this.middleware.length > 0) {
        this.config = await this.applyMiddleware(this.config);
      }

      // Emit configuration change event
      if (oldConfig !== this.config) {
        const changeEvent: ConfigChangeEvent = {
          environment: this.environment,
          oldConfig,
          newConfig: this.config,
          changes: this.detectChanges(oldConfig, this.config),
          timestamp: new Date(),
        };

        this.emit('configChanged', changeEvent);
        this.notifyWatchers(changeEvent);
      }

      this.emit('initialized', this.config);
      return this.config;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): BaseConfig {
    if (!this.initialized || !this.config) {
      throw new Error('Configuration manager not initialized. Call initialize() first.');
    }
    return deepClone(this.config);
  }

  /**
   * Get a specific configuration section with type safety
   */
  getSection<K extends ConfigSectionKey>(
    section: K,
    options: ConfigAccessOptions = {}
  ): ConfigSection<K> {
    const config = this.getConfig();
    const value = config[section];

    if (value === undefined && options.defaultValue !== undefined) {
      return options.defaultValue;
    }

    if (options.validate && value !== undefined) {
      try {
        // Extract the section schema from the base schema
        const sectionSchema = this.validationSchema.shape[section];
        if (sectionSchema) {
          sectionSchema.parse(value);
        }
      } catch (error) {
        this.emit('validationError', { section, value, error });
        throw new Error(`Configuration section '${section}' validation failed: ${error}`);
      }
    }

    return deepClone(value) as ConfigSection<K>;
  }

  /**
   * Get a nested configuration value with type safety
   */
  get<T = any>(path: string, defaultValue?: T): T {
    const config = this.getConfig();
    const keys = path.split('.');
    let current: any = config;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue as T;
      }
    }

    return deepClone(current) as T;
  }

  /**
   * Check if a configuration path exists
   */
  has(path: string): boolean {
    try {
      this.get(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get feature flag value
   */
  isFeatureEnabled(feature: keyof BaseConfig['features']): boolean {
    return this.get(`features.${feature}`, false) as boolean;
  }

  /**
   * Get app metadata
   */
  getAppMetadata() {
    return this.getSection('app');
  }

  /**
   * Get environment settings
   */
  getEnvironment() {
    return this.getSection('env');
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return this.getSection('security');
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig() {
    return this.getSection('database');
  }

  /**
   * Get authentication configuration
   */
  getAuthConfig() {
    return this.getSection('auth');
  }

  /**
   * Get email configuration
   */
  getEmailConfig() {
    return this.getSection('email');
  }

  /**
   * Get storage configuration
   */
  getStorageConfig() {
    return this.getSection('storage');
  }

  /**
   * Get billing configuration
   */
  getBillingConfig() {
    return this.getSection('billing');
  }

  /**
   * Get integrations configuration
   */
  getIntegrationsConfig() {
    return this.getSection('integrations');
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig() {
    return this.getSection('monitoring');
  }

  /**
   * Get cache configuration
   */
  getCacheConfig() {
    return this.getSection('cache');
  }

  /**
   * Get API configuration
   */
  getApiConfig() {
    return this.getSection('api');
  }

  /**
   * Reload configuration
   */
  async reload(options: ConfigLoaderOptions = {}): Promise<BaseConfig> {
    this.cache.clear();
    return await this.initialize(options);
  }

  /**
   * Switch environment
   */
  async switchEnvironment(environment: Environment, options: ConfigLoaderOptions = {}): Promise<BaseConfig> {
    this.environment = environment;
    this.cache.clear();
    return await this.initialize(options);
  }

  /**
   * Validate current configuration
   */
  async validate(): Promise<{ valid: boolean; errors: string[] }> {
    if (!this.config) {
      return { valid: false, errors: ['Configuration not loaded'] };
    }

    return await validateConfig(this.config);
  }

  /**
   * Add middleware
   */
  use(middleware: ConfigMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Remove middleware
   */
  removeMiddleware(middleware: ConfigMiddleware): void {
    const index = this.middleware.indexOf(middleware);
    if (index > -1) {
      this.middleware.splice(index, 1);
    }
  }

  /**
   * Add configuration watcher
   */
  watch(watcher: ConfigWatcher): void {
    this.watchers.add(watcher);
  }

  /**
   * Remove configuration watcher
   */
  unwatch(watcher: ConfigWatcher): void {
    this.watchers.delete(watcher);
  }

  /**
   * Get sanitized configuration (for logging)
   */
  getSanitizedConfig(): Partial<BaseConfig> {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return sanitizeConfig(this.config);
  }

  /**
   * Export configuration
   */
  export(format: 'json' | 'yaml' | 'env' = 'json'): string {
    const config = this.getConfig();
    
    switch (format) {
      case 'json':
        return JSON.stringify(config, null, 2);
      case 'yaml':
        // Would need yaml library
        throw new Error('YAML export not implemented');
      case 'env':
        return this.configToEnvVars(config);
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  }

  /**
   * Get configuration load result
   */
  getLoadResult(): ConfigLoadResult | null {
    return this.lastLoadResult;
  }

  /**
   * Check if manager is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current environment
   */
  getCurrentEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Apply middleware to configuration
   */
  private async applyMiddleware(config: BaseConfig): Promise<BaseConfig> {
    let processedConfig = config;
    
    for (const middleware of this.middleware) {
      try {
        processedConfig = await middleware(processedConfig, this.environment);
      } catch (error) {
        this.emit('middlewareError', { middleware, error });
        throw new Error(`Middleware failed: ${error}`);
      }
    }
    
    return processedConfig;
  }

  /**
   * Detect changes between configurations
   */
  private detectChanges(oldConfig: BaseConfig | null, newConfig: BaseConfig): string[] {
    if (!oldConfig) {
      return ['Initial configuration loaded'];
    }

    const changes: string[] = [];
    
    // Simple change detection - in practice, you'd want a more sophisticated diff
    const oldStr = JSON.stringify(oldConfig);
    const newStr = JSON.stringify(newConfig);
    
    if (oldStr !== newStr) {
      changes.push('Configuration changed');
    }
    
    return changes;
  }

  /**
   * Notify all watchers of configuration change
   */
  private async notifyWatchers(event: ConfigChangeEvent): Promise<void> {
    const promises = Array.from(this.watchers).map(async (watcher) => {
      try {
        await watcher(event);
      } catch (error) {
        this.emit('watcherError', { watcher, error });
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Convert configuration to environment variables format
   */
  private configToEnvVars(config: BaseConfig): string {
    const envVars: string[] = [];
    
    // This is a simplified implementation
    envVars.push(`NODE_ENV=${config.env.NODE_ENV}`);
    envVars.push(`DEBUG=${config.env.DEBUG}`);
    envVars.push(`LOG_LEVEL=${config.env.LOG_LEVEL}`);
    envVars.push(`PORT=${config.env.PORT}`);
    envVars.push(`HOST=${config.env.HOST}`);
    
    if (config.database.url) {
      envVars.push(`DATABASE_URL=${config.database.url}`);
    }
    
    if (config.auth.jwt.secret) {
      envVars.push(`JWT_SECRET=${config.auth.jwt.secret}`);
    }
    
    // Add more mappings as needed
    
    return envVars.join('\n');
  }
}

/**
 * Global configuration manager instance
 */
let globalConfigManager: ConfigManager | null = null;

/**
 * Get or create global configuration manager
 */
export function getConfigManager(environment?: Environment): ConfigManager {
  if (!globalConfigManager) {
    globalConfigManager = new ConfigManager(environment);
  }
  return globalConfigManager;
}

/**
 * Initialize global configuration manager
 */
export async function initializeGlobalConfig(
  environment?: Environment,
  options: ConfigLoaderOptions = {}
): Promise<BaseConfig> {
  const manager = getConfigManager(environment);
  return await manager.initialize(options);
}

/**
 * Get configuration from global manager
 */
export function getGlobalConfig(): BaseConfig {
  const manager = getConfigManager();
  return manager.getConfig();
}

/**
 * Type-safe configuration access helpers
 */
export const config = {
  /**
   * Get full configuration
   */
  get: (): BaseConfig => getGlobalConfig(),
  
  /**
   * Get configuration section
   */
  section: <K extends ConfigSectionKey>(section: K): ConfigSection<K> => {
    const manager = getConfigManager();
    return manager.getSection(section);
  },
  
  /**
   * Get nested configuration value
   */
  value: <T = any>(path: string, defaultValue?: T): T => {
    const manager = getConfigManager();
    return manager.get(path, defaultValue);
  },
  
  /**
   * Check if feature is enabled
   */
  feature: (feature: keyof BaseConfig['features']): boolean => {
    const manager = getConfigManager();
    return manager.isFeatureEnabled(feature);
  },
  
  /**
   * Get app metadata
   */
  app: () => config.section('app'),
  
  /**
   * Get environment settings
   */
  env: () => config.section('env'),
  
  /**
   * Get security configuration
   */
  security: () => config.section('security'),
  
  /**
   * Get database configuration
   */
  database: () => config.section('database'),
  
  /**
   * Get authentication configuration
   */
  auth: () => config.section('auth'),
  
  /**
   * Get email configuration
   */
  email: () => config.section('email'),
  
  /**
   * Get storage configuration
   */
  storage: () => config.section('storage'),
  
  /**
   * Get billing configuration
   */
  billing: () => config.section('billing'),
  
  /**
   * Get integrations configuration
   */
  integrations: () => config.section('integrations'),
  
  /**
   * Get monitoring configuration
   */
  monitoring: () => config.section('monitoring'),
  
  /**
   * Get cache configuration
   */
  cache: () => config.section('cache'),
  
  /**
   * Get API configuration
   */
  api: () => config.section('api'),
};

// Export types
export type {
  ConfigChangeEvent,
  ConfigMiddleware,
  ConfigWatcher,
  ConfigAccessOptions,
  ConfigSectionKey,
  ConfigSection,
};