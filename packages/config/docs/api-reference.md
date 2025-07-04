# API Reference

Complete API documentation for @nextsaas/config package.

## Table of Contents

1. [Core Functions](#core-functions)
2. [ConfigManager Class](#configmanager-class)
3. [React Hooks](#react-hooks)
4. [Security Functions](#security-functions)
5. [Secret Management](#secret-management)
6. [Utility Functions](#utility-functions)
7. [Type Definitions](#type-definitions)
8. [Constants and Enums](#constants-and-enums)

## Core Functions

### `loadConfig(options?: ConfigLoaderOptions): Promise<ConfigLoadResult>`

Loads and validates configuration for the specified environment.

```typescript
const result = await loadConfig({
  environment: 'production',
  envVars: process.env,
  strict: true,
  validate: true,
  throwOnError: false,
  mergeWithDefaults: true,
});
```

**Parameters:**
- `environment`: Environment to load (development, staging, production, test)
- `envVars`: Environment variables object (defaults to process.env)
- `strict`: Enable strict validation mode
- `validate`: Run Zod validation on configuration
- `throwOnError`: Throw error on validation failure
- `mergeWithDefaults`: Merge with environment defaults

**Returns:** `ConfigLoadResult` with config, errors, and warnings

### `initializeGlobalConfig(environment?: Environment, options?: ConfigLoaderOptions): Promise<BaseConfig>`

Initializes the global configuration manager.

```typescript
const config = await initializeGlobalConfig('production', {
  validate: true,
  throwOnError: true,
});
```

### `validateConfig(config: unknown): Promise<ValidationResult>`

Validates a configuration object against the schema.

```typescript
const result = await validateConfig(myConfig);
if (!result.valid) {
  console.error(result.errors);
}
```

### `exportConfig(environment: Environment, format: 'json' | 'env'): Promise<string>`

Exports configuration in the specified format.

```typescript
const json = await exportConfig('production', 'json');
const envVars = await exportConfig('production', 'env');
```

### `getCurrentEnvironment(): Environment`

Gets the current environment from NODE_ENV.

```typescript
const env = getCurrentEnvironment(); // 'development' | 'staging' | 'production' | 'test'
```

### `clearConfigCache(): void`

Clears the configuration cache.

```typescript
clearConfigCache();
```

## ConfigManager Class

### Constructor

```typescript
const manager = new ConfigManager(environment?: Environment, options?: ConfigLoaderOptions);
```

### Methods

#### `initialize(options?: ConfigLoaderOptions): Promise<BaseConfig>`

Initializes the configuration manager.

```typescript
await manager.initialize({ validate: true });
```

#### `getConfig(): BaseConfig`

Gets the current configuration (must be initialized).

```typescript
const config = manager.getConfig();
```

#### `getSection<K>(section: K): ConfigSection<K>`

Gets a specific configuration section with type safety.

```typescript
const dbConfig = manager.getSection('database');
const features = manager.getSection('features');
```

#### `get<T>(path: string, defaultValue?: T): T`

Gets a nested configuration value.

```typescript
const port = manager.get('env.PORT', 3000);
const appName = manager.get('app.name');
```

#### `has(path: string): boolean`

Checks if a configuration path exists.

```typescript
if (manager.has('database.ssl.enabled')) {
  // SSL is configured
}
```

#### `isFeatureEnabled(feature: keyof Features): boolean`

Checks if a feature flag is enabled.

```typescript
if (manager.isFeatureEnabled('multiTenant')) {
  // Multi-tenant logic
}
```

#### `reload(options?: ConfigLoaderOptions): Promise<BaseConfig>`

Reloads the configuration.

```typescript
await manager.reload();
```

#### `switchEnvironment(environment: Environment): Promise<BaseConfig>`

Switches to a different environment.

```typescript
await manager.switchEnvironment('staging');
```

#### `use(middleware: ConfigMiddleware): void`

Adds middleware to transform configuration.

```typescript
manager.use((config, env) => {
  // Transform config
  return config;
});
```

#### `watch(watcher: ConfigWatcher): void`

Adds a watcher for configuration changes.

```typescript
manager.watch((event) => {
  console.log('Config changed:', event);
});
```

#### `validate(): Promise<ValidationResult>`

Validates the current configuration.

```typescript
const result = await manager.validate();
```

#### `getSanitizedConfig(): Partial<BaseConfig>`

Gets configuration with sensitive data redacted.

```typescript
const safe = manager.getSanitizedConfig();
console.log(safe); // Secrets are masked
```

#### `export(format: 'json' | 'env'): string`

Exports the current configuration.

```typescript
const json = manager.export('json');
```

### Convenience Methods

- `getAppMetadata()`: Get app configuration
- `getEnvironment()`: Get environment settings
- `getDatabaseConfig()`: Get database configuration
- `getAuthConfig()`: Get authentication configuration
- `getEmailConfig()`: Get email configuration
- `getStorageConfig()`: Get storage configuration
- `getBillingConfig()`: Get billing configuration
- `getIntegrationsConfig()`: Get integrations configuration
- `getMonitoringConfig()`: Get monitoring configuration
- `getCacheConfig()`: Get cache configuration
- `getApiConfig()`: Get API configuration

## React Hooks

### `useConfig(): ConfigContextValue`

Access the configuration context.

```typescript
const { config, loading, error, reload } = useConfig();
```

**Returns:**
- `config`: Current configuration or null
- `environment`: Current environment
- `loading`: Loading state
- `error`: Error object if any
- `validationErrors`: Validation errors array
- `missingEnvVars`: Missing environment variables
- `warnings`: Configuration warnings
- `reload`: Function to reload configuration
- `isInitialized`: Whether config is initialized

### `useConfigData(): BaseConfig`

Get configuration data (throws if not loaded).

```typescript
const config = useConfigData();
```

### `useConfigSection<K>(section: K): ConfigSection<K>`

Get a specific configuration section.

```typescript
const database = useConfigSection('database');
const features = useConfigSection('features');
```

### `useFeature(feature: keyof Features): boolean`

Check if a feature is enabled.

```typescript
const aiEnabled = useFeature('aiIntegration');
```

### `useAppMetadata(): AppMetadata`

Get application metadata.

```typescript
const { name, version, url } = useAppMetadata();
```

### Additional Hooks

- `useEnvironment()`: Get environment configuration
- `useSecurityConfig()`: Get security configuration
- `useDatabaseConfig()`: Get database configuration
- `useAuthConfig()`: Get authentication configuration
- `useEmailConfig()`: Get email configuration
- `useStorageConfig()`: Get storage configuration
- `useBillingConfig()`: Get billing configuration
- `useIntegrationsConfig()`: Get integrations configuration
- `useMonitoringConfig()`: Get monitoring configuration
- `useCacheConfig()`: Get cache configuration
- `useApiConfig()`: Get API configuration

## Security Functions

### `generateSecureSecret(length?: number, charset?: string): string`

Generates a cryptographically secure random string.

```typescript
const secret = generateSecureSecret(64);
const customSecret = generateSecureSecret(32, 'ABCDEF0123456789');
```

### `generateApiKey(prefix?: string, length?: number): string`

Generates a secure API key with prefix.

```typescript
const apiKey = generateApiKey('sk_live', 32); // sk_live_ABC...
```

### `generateSecureUUID(): string`

Generates a secure UUID v4.

```typescript
const id = generateSecureUUID();
```

### `generateSecureHash(value: string, salt?: string): string`

Generates a secure hash of a value.

```typescript
const hash = generateSecureHash('myValue', 'salt');
```

### `validateSecretStrength(secret: string): SecretValidationResult`

Validates the strength of a secret.

```typescript
const result = validateSecretStrength(password);
if (!result.valid) {
  console.error('Weak password:', result.errors);
  console.log('Suggestions:', result.suggestions);
}
```

**Returns:**
- `valid`: Whether the secret is valid
- `strength`: 'weak' | 'medium' | 'strong'
- `score`: Numeric score (0-100)
- `errors`: Validation errors
- `suggestions`: Improvement suggestions

### `encryptValue(value: string, key: string): EncryptionResult`

Encrypts a value using AES-256-GCM.

```typescript
const encrypted = encryptValue('sensitive-data', encryptionKey);
// Returns: { encrypted, iv, tag, salt }
```

### `decryptValue(options: DecryptionOptions): string`

Decrypts a value.

```typescript
const decrypted = decryptValue({
  encrypted: encrypted.encrypted,
  iv: encrypted.iv,
  tag: encrypted.tag,
  salt: encrypted.salt,
  key: encryptionKey,
});
```

### `secureCompare(a: string, b: string): boolean`

Performs timing-safe string comparison.

```typescript
if (secureCompare(userToken, storedToken)) {
  // Tokens match
}
```

### `hashPassword(password: string, saltRounds?: number): string`

Hashes a password using PBKDF2.

```typescript
const hash = hashPassword('userPassword', 12);
```

### `verifyPassword(password: string, hash: string): boolean`

Verifies a password against a hash.

```typescript
if (verifyPassword(inputPassword, storedHash)) {
  // Password is correct
}
```

### `sanitizeEnvVars(envVars: Record<string, string>): Record<string, string>`

Sanitizes environment variables by masking sensitive values.

```typescript
const safe = sanitizeEnvVars(process.env);
console.log(safe); // Secrets are masked
```

### `validateEnvSecurity(envVars: Record<string, string>): EnvSecurityResult`

Validates environment variable security.

```typescript
const result = validateEnvSecurity(process.env);
if (!result.secure) {
  console.error('Security issues:', result.vulnerabilities);
}
```

### `generateSecureConfigTemplate(environment: Environment): Record<string, string>`

Generates secure configuration template.

```typescript
const template = generateSecureConfigTemplate('production');
```

## Secret Management

### `createSecretProvider(config: SecretProviderConfig): SecretProvider`

Creates a secret provider instance.

```typescript
const provider = createSecretProvider({
  provider: 'aws-secrets-manager',
  region: 'us-east-1',
});
```

### `SecretManager` Class

Manages multiple secret providers with fallback.

```typescript
const manager = new SecretManager([
  awsProvider,
  fileProvider,
  envProvider,
], 300000); // 5 min cache TTL
```

**Methods:**
- `getSecret(name: string, version?: string): Promise<Secret>`
- `getSecretValue(name: string, version?: string): Promise<string>`
- `listSecrets(): Promise<SecretMetadata[]>`
- `createSecret(secret: Secret): Promise<void>`
- `updateSecret(name: string, value: string): Promise<void>`
- `rotateSecret(name: string): Promise<string>`
- `clearCache(): void`
- `setCacheTtl(ttl: number): void`

### `getConfigSecret(name: string, fallback?: string): Promise<string>`

Gets a secret from available sources.

```typescript
const dbPassword = await getConfigSecret('DB_PASSWORD', 'default');
```

### `getConfigSecrets(names: string[]): Promise<Record<string, string>>`

Gets multiple secrets.

```typescript
const secrets = await getConfigSecrets(['JWT_SECRET', 'API_KEY']);
```

### `validateSecrets(required: string[]): Promise<ValidationResult>`

Validates required secrets exist.

```typescript
const result = await validateSecrets(['JWT_SECRET', 'SESSION_SECRET']);
if (!result.valid) {
  console.error('Missing secrets:', result.missing);
}
```

## Utility Functions

### `validateEnvVar(definition: EnvVarDefinition, value?: string): ValidationResult`

Validates a single environment variable.

```typescript
const result = validateEnvVar({
  name: 'PORT',
  type: 'number',
  required: true,
}, '3000');
```

### `validateEnvVars(definitions: EnvVarDefinition[], envVars?: Record<string, string>): ValidationResult`

Validates multiple environment variables.

```typescript
const result = validateEnvVars(definitions, process.env);
```

### `generateEnvVarDefinitions(environment: Environment): EnvVarDefinition[]`

Generates environment variable definitions.

```typescript
const definitions = generateEnvVarDefinitions('production');
```

### `deepClone<T>(obj: T): T`

Deep clones an object.

```typescript
const cloned = deepClone(originalConfig);
```

### `isEmpty(value: any): boolean`

Checks if a value is empty.

```typescript
if (isEmpty(config.database.url)) {
  throw new Error('Database URL required');
}
```

### `sanitizeConfig(config: BaseConfig): Partial<BaseConfig>`

Sanitizes configuration for logging.

```typescript
const safe = sanitizeConfig(config);
console.log(safe); // Safe to log
```

### `getConfigSummary(config: BaseConfig): ConfigSummary`

Gets configuration summary.

```typescript
const summary = getConfigSummary(config);
console.log('Features:', summary.features);
console.log('Services:', summary.services);
```

### `isValidUrl(url: string): boolean`

Validates URL format.

```typescript
if (!isValidUrl(config.app.url)) {
  throw new Error('Invalid app URL');
}
```

### `isValidEmail(email: string): boolean`

Validates email format.

```typescript
if (!isValidEmail(config.app.supportEmail)) {
  throw new Error('Invalid support email');
}
```

### `generateRandomString(length?: number): string`

Generates a random alphanumeric string.

```typescript
const id = generateRandomString(16);
```

### `formatConfigForDisplay(config: BaseConfig): string`

Formats configuration for display (sanitized).

```typescript
const formatted = formatConfigForDisplay(config);
console.log(formatted);
```

## Type Definitions

### `BaseConfig`

The main configuration type containing all sections.

```typescript
interface BaseConfig {
  app: AppMetadata;
  env: EnvironmentConfig;
  features: FeatureFlags;
  security: SecurityConfig;
  cache: CacheConfig;
  api: ApiConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  email: EmailConfig;
  storage: StorageConfig;
  billing: BillingConfig;
  integrations: IntegrationsConfig;
  monitoring: MonitoringConfig;
}
```

### `Environment`

Valid environment types.

```typescript
type Environment = 'development' | 'staging' | 'production' | 'test';
```

### `ConfigLoadResult`

Result of configuration loading.

```typescript
interface ConfigLoadResult {
  config: BaseConfig;
  environment: Environment;
  validationErrors: string[];
  missingEnvVars: string[];
  warnings: string[];
}
```

### `ConfigLoaderOptions`

Options for loading configuration.

```typescript
interface ConfigLoaderOptions {
  environment?: Environment;
  envVars?: Record<string, string>;
  strict?: boolean;
  validate?: boolean;
  throwOnError?: boolean;
  mergeWithDefaults?: boolean;
}
```

### `SecretValidationResult`

Result of secret validation.

```typescript
interface SecretValidationResult {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  errors: string[];
  suggestions: string[];
}
```

### `EnvVarDefinition`

Environment variable definition.

```typescript
interface EnvVarDefinition {
  name: string;
  value?: string;
  required?: boolean;
  description?: string;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'json';
  default?: any;
  validation?: (value: any) => boolean | string;
}
```

## Constants and Enums

### Database Providers

```typescript
enum DatabaseProvider {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
  MONGODB = 'mongodb',
}
```

### Email Providers

```typescript
enum EmailProvider {
  SMTP = 'smtp',
  SENDGRID = 'sendgrid',
  MAILGUN = 'mailgun',
  AWS_SES = 'aws-ses',
  POSTMARK = 'postmark',
}
```

### Storage Providers

```typescript
enum StorageProvider {
  LOCAL = 'local',
  AWS_S3 = 'aws-s3',
  AZURE = 'azure',
  GCS = 'gcs',
}
```

### Log Levels

```typescript
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
```

### Feature Flags

```typescript
interface FeatureFlags {
  authentication: boolean;
  billing: boolean;
  subscriptions: boolean;
  fileUploads: boolean;
  emailNotifications: boolean;
  multiTenant: boolean;
  apiRateLimiting: boolean;
  advancedAnalytics: boolean;
  realTimeFeatures: boolean;
  webhookSupport: boolean;
  aiIntegration: boolean;
  advancedReporting: boolean;
  customDomains: boolean;
  whiteLabeling: boolean;
  debugMode: boolean;
  performanceTracking: boolean;
  errorReporting: boolean;
  metricsCollection: boolean;
}
```