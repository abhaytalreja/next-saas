# @nextsaas/config

A comprehensive, type-safe configuration system for NextSaaS applications with environment-specific settings, runtime validation, and secure secret management.

## Features

- 🔒 **Type-Safe**: Full TypeScript support with auto-generated types from Zod schemas
- 🌍 **Multi-Environment**: Separate configurations for development, staging, production, and test
- ✅ **Runtime Validation**: Validate configuration at runtime using Zod schemas
- 🔐 **Secret Management**: Built-in utilities for secure secret handling and encryption
- 🚀 **Zero Config**: Works out of the box with sensible defaults
- 📝 **Auto Documentation**: Generate docs and types automatically
- 🔧 **CLI Tools**: Manage configuration via command line
- ⚛️ **React Integration**: Optional React hooks and context providers
- 🌐 **i18n Ready**: Built-in support for internationalization

## Quick Start

### Installation

```bash
npm install @nextsaas/config
# or
yarn add @nextsaas/config
# or
pnpm add @nextsaas/config
```

### Basic Usage

```typescript
import { initializeGlobalConfig, config } from '@nextsaas/config';

// Initialize configuration
await initializeGlobalConfig();

// Access configuration
const dbConfig = config.database();
const isFeatureEnabled = config.feature('aiIntegration');
const appName = config.value('app.name');
```

### React Integration

```tsx
import { ConfigProvider, useConfig, FeatureGate } from '@nextsaas/config';

function App() {
  return (
    <ConfigProvider>
      <MyApp />
    </ConfigProvider>
  );
}

function MyApp() {
  const { config } = useConfig();
  const authConfig = useAuthConfig();

  return (
    <div>
      <h1>{config.app.name}</h1>
      <FeatureGate feature="aiIntegration">
        <AIComponent />
      </FeatureGate>
    </div>
  );
}
```

## Configuration Structure

The configuration system is organized into the following sections:

- **app**: Application metadata (name, URL, emails)
- **env**: Environment settings (NODE_ENV, debug, logging)
- **features**: Feature flags for toggling functionality
- **security**: CORS, rate limiting, CSP, HTTPS settings
- **database**: Database connection and pooling
- **auth**: JWT, sessions, OAuth, password policies
- **email**: Email providers and templates
- **storage**: File storage (local, S3, Azure, GCS)
- **billing**: Payment providers and subscription plans
- **integrations**: Third-party service integrations
- **monitoring**: Logging, metrics, tracing, and alerts

## Environment Variables

### Setting Up Environment Files

1. Generate environment templates:
```bash
npx nextsaas-config init
```

2. This creates `.env.{environment}` files with all available options:
```bash
.env.development
.env.staging
.env.production
.env.test
```

3. Fill in your specific values:
```env
# .env.development
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/myapp_dev
JWT_SECRET=dev-secret-change-in-production
```

### Required Variables by Environment

#### Production
- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`
- `FROM_EMAIL`
- `STRIPE_SECRET_KEY` (if billing enabled)
- `APP_URL`

#### Staging
- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`

#### Development/Test
- No required variables (uses defaults)

## CLI Commands

### Configuration Management

```bash
# Validate configuration
npx nextsaas-config validate --env production

# Export configuration
npx nextsaas-config export --env production --format json

# Interactive setup
npx nextsaas-config setup --interactive

# Generate environment templates
npx nextsaas-config env --template
```

### Code Generation

```bash
# Generate TypeScript types
npm run generate:types

# Generate documentation
npm run generate:docs

# Generate environment templates
npm run generate:env
```

## Advanced Usage

### Custom Configuration Manager

```typescript
import { ConfigManager } from '@nextsaas/config';

const manager = new ConfigManager('production');
await manager.initialize();

// Watch for changes
manager.watch((event) => {
  console.log('Config changed:', event.changes);
});

// Add middleware
manager.use(async (config, env) => {
  // Transform config
  return config;
});

// Get specific sections
const dbConfig = manager.getDatabaseConfig();
const features = manager.getSection('features');
```

### Secret Management

```typescript
import { 
  generateSecureSecret,
  validateSecretStrength,
  encryptValue,
  SecretManager 
} from '@nextsaas/config';

// Generate secure secrets
const apiKey = generateApiKey('sk', 32);
const secret = generateSecureSecret(64);

// Validate secret strength
const validation = validateSecretStrength(userPassword);
if (!validation.valid) {
  console.error(validation.errors);
}

// Encrypt sensitive data
const encrypted = encryptValue(sensitiveData, encryptionKey);

// Use external secret stores
const secretManager = new SecretManager([
  new AWSSecretsManagerProvider({ region: 'us-east-1' }),
  new EnvSecretProvider(),
]);

const dbPassword = await secretManager.getSecretValue('DB_PASSWORD');
```

### Environment-Specific Overrides

```typescript
// In your code
import { developmentConfig, productionConfig } from '@nextsaas/config';

const customConfig = {
  ...developmentConfig,
  database: {
    ...developmentConfig.database,
    pool: {
      min: 5,
      max: 20,
    },
  },
};
```

## Testing

The package includes comprehensive test coverage:

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Testing Your Configuration

```typescript
import { validateConfig, loadConfig } from '@nextsaas/config';

describe('My App Config', () => {
  it('should have valid production config', async () => {
    const result = await loadConfig({ 
      environment: 'production',
      envVars: {
        DATABASE_URL: 'postgresql://...',
        JWT_SECRET: 'secret',
      }
    });
    
    expect(result.validationErrors).toHaveLength(0);
    expect(result.config.database.url).toBeDefined();
  });
});
```

## Security Best Practices

1. **Never commit secrets**: Use `.env` files and add them to `.gitignore`
2. **Use strong secrets**: Minimum 32 characters for JWT/session secrets
3. **Rotate secrets regularly**: Use the built-in rotation utilities
4. **Validate configuration**: Always validate before deployment
5. **Use secret managers**: Integrate with AWS Secrets Manager, Vault, etc.

## Internationalization (i18n)

The configuration system includes i18n support:

```typescript
// Access i18n configuration
const i18nConfig = config.value('app.i18n', {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr'],
});

// In React
import { useI18nConfig } from '@nextsaas/config';

function LanguageSelector() {
  const { locales, defaultLocale } = useI18nConfig();
  // Render language selector
}
```

## Performance Optimization

- Configuration is cached after first load
- Lazy loading for React components
- Minimal bundle size with tree-shaking
- Optional dependencies for external integrations

## Troubleshooting

### Common Issues

**Missing required environment variables**
```bash
npx nextsaas-config validate --env production
# Shows missing variables and how to fix
```

**Type errors after schema changes**
```bash
npm run generate:types
# Regenerate TypeScript types
```

**Configuration not loading**
```typescript
// Ensure initialization
await initializeGlobalConfig();
// or check for errors
const result = await loadConfig({ throwOnError: false });
console.log(result.validationErrors);
```

## API Reference

### Core Functions

- `loadConfig(options)`: Load and validate configuration
- `initializeGlobalConfig(env?, options?)`: Initialize global config
- `validateConfig(config)`: Validate configuration object
- `exportConfig(env, format)`: Export configuration

### React Hooks

- `useConfig()`: Access configuration context
- `useConfigData()`: Get configuration data
- `useFeature(name)`: Check if feature is enabled
- `useConfigSection(section)`: Get specific section

### Security Functions

- `generateSecureSecret(length, charset?)`: Generate random secret
- `validateSecretStrength(secret)`: Check secret strength
- `encryptValue(value, key)`: Encrypt sensitive data
- `sanitizeEnvVars(vars)`: Remove sensitive data for logging

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development setup and guidelines.

## License

MIT © NextSaaS Team