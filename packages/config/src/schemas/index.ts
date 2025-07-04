/**
 * Configuration Schemas Index
 * 
 * Exports all configuration schemas and their types for use throughout the application.
 * These schemas provide runtime validation and TypeScript types for all configuration.
 */

// Schema exports
export * from './auth';
export * from './billing';
export * from './database';
export * from './email';
export * from './integrations';
export * from './monitoring';
export * from './storage';

// Re-export schema types for convenience
export type {
  AuthConfig,
  JwtConfig,
  SessionConfig,
  PasswordPolicy,
} from './auth';

export type {
  BillingConfig,
  PaymentProvider,
  SubscriptionPlan,
  Currency,
} from './billing';

export type {
  DatabaseConfig,
  DatabaseProvider,
} from './database';

export type {
  EmailConfig,
  EmailProvider,
  SenderConfig,
} from './email';

export type {
  IntegrationsConfig,
  AnalyticsIntegrations,
  SupportIntegrations,
} from './integrations';

export type {
  MonitoringConfig,
  LogLevel,
  LoggingConfig,
} from './monitoring';

export type {
  StorageConfig,
  StorageProvider,
  UploadLimits,
} from './storage';