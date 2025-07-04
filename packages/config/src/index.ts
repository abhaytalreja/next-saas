/**
 * NextSaaS Configuration Package
 * 
 * This package provides a comprehensive configuration system for NextSaaS applications.
 * It includes:
 * - Zod-based schema validation
 * - Environment-specific configurations
 * - Type-safe configuration access
 * - Runtime validation and error handling
 * - React context providers for configuration access
 * - CLI tools for configuration management
 * - Auto-generation of types and documentation
 */

// Core configuration exports
export * from './loader';
export * from './environments/base';
export * from './environments/development';
export * from './environments/staging';
export * from './environments/production';
export * from './environments/test';

// Schema exports
export * from './schemas';

// Re-export commonly used types
export type {
  BaseConfig,
  AppMetadata,
  EnvironmentConfig,
  FeatureFlags,
  SecurityConfig,
  CacheConfig,
  ApiConfig,
} from './environments/base';

export type {
  Environment,
  ConfigLoaderOptions,
  ConfigLoadResult,
} from './loader';

// Re-export configuration functions
export {
  loadConfig,
  getConfig,
  initializeConfig,
  validateConfig,
  clearConfigCache,
  getConfigSchema,
  isConfigInitialized,
  exportConfig,
  getCurrentEnvironment,
} from './loader';

// React exports (optional, only if React is available)
export * from './react';

// Manager exports
export * from './manager';

// Utility exports
export * from './utils';

// Type generator exports
export * from './type-generator';

// Security exports
export * from './security';

// Secret manager exports
export * from './secret-manager';

// Default export for convenience
export { loadConfig as default } from './loader';