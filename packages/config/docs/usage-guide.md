# Configuration Usage Guide

This guide provides detailed instructions on using the NextSaaS configuration system in your application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Configuration Loading](#configuration-loading)
3. [Type-Safe Access](#type-safe-access)
4. [React Integration](#react-integration)
5. [Environment Management](#environment-management)
6. [Secret Management](#secret-management)
7. [Advanced Patterns](#advanced-patterns)
8. [Best Practices](#best-practices)

## Getting Started

### Installation and Setup

1. Install the package:
```bash
npm install @nextsaas/config
```

2. Run the interactive setup:
```bash
npx nextsaas-config setup --interactive
```

3. Initialize in your application:
```typescript
// app.ts or server.ts
import { initializeGlobalConfig } from '@nextsaas/config';

async function bootstrap() {
  // Initialize configuration
  await initializeGlobalConfig();
  
  // Start your application
  startServer();
}

bootstrap().catch(console.error);
```

## Configuration Loading

### Basic Loading

```typescript
import { loadConfig } from '@nextsaas/config';

// Load with defaults
const result = await loadConfig();

// Load specific environment
const prodResult = await loadConfig({ 
  environment: 'production' 
});

// Load with custom env vars
const customResult = await loadConfig({
  envVars: {
    DATABASE_URL: 'postgresql://custom:5432/db',
    JWT_SECRET: 'custom-secret',
  },
});
```

### Error Handling

```typescript
// Handle errors gracefully
const result = await loadConfig({ 
  throwOnError: false 
});

if (result.validationErrors.length > 0) {
  console.error('Validation errors:', result.validationErrors);
}

if (result.missingEnvVars.length > 0) {
  console.error('Missing vars:', result.missingEnvVars);
}

// Or throw on error
try {
  await loadConfig({ throwOnError: true });
} catch (error) {
  console.error('Config failed:', error);
  process.exit(1);
}
```

## Type-Safe Access

### Using the Config Helper

```typescript
import { config } from '@nextsaas/config';

// Get full configuration
const fullConfig = config.get();

// Get specific sections
const dbConfig = config.database();
const authConfig = config.auth();
const features = config.section('features');

// Get nested values with defaults
const appName = config.value('app.name', 'Default App');
const debugMode = config.value('env.DEBUG', false);

// Check feature flags
if (config.feature('multiTenant')) {
  // Multi-tenant logic
}
```

### Using ConfigManager

```typescript
import { ConfigManager } from '@nextsaas/config';

class MyService {
  private config: ConfigManager;
  
  constructor() {
    this.config = new ConfigManager();
  }
  
  async initialize() {
    await this.config.initialize();
  }
  
  getDatabaseUrl(): string {
    return this.config.get('database.url');
  }
  
  isDebugMode(): boolean {
    return this.config.get('env.DEBUG', false);
  }
}
```

## React Integration

### Setting Up ConfigProvider

```tsx
// app.tsx
import { ConfigProvider } from '@nextsaas/config';

export function App() {
  return (
    <ConfigProvider 
      options={{ environment: 'production' }}
      fallback={<LoadingSpinner />}
      onError={(error) => console.error(error)}
    >
      <Router>
        <Routes>
          {/* Your routes */}
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
```

### Using Configuration Hooks

```tsx
import { 
  useConfig, 
  useAppMetadata,
  useFeature,
  useAuthConfig 
} from '@nextsaas/config';

function Header() {
  const { config, loading, error } = useConfig();
  const appMeta = useAppMetadata();
  const showBilling = useFeature('billing');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Config error: {error.message}</div>;
  
  return (
    <header>
      <h1>{appMeta.name}</h1>
      {showBilling && <BillingStatus />}
    </header>
  );
}
```

### Feature Gates

```tsx
import { FeatureGate } from '@nextsaas/config';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <FeatureGate feature="advancedAnalytics">
        <AdvancedAnalytics />
      </FeatureGate>
      
      <FeatureGate 
        feature="aiIntegration" 
        fallback={<UpgradePrompt />}
      >
        <AIAssistant />
      </FeatureGate>
    </div>
  );
}
```

### Environment Gates

```tsx
import { EnvironmentGate } from '@nextsaas/config';

function AdminPanel() {
  return (
    <EnvironmentGate environments={['development', 'staging']}>
      <DebugPanel />
    </EnvironmentGate>
  );
}
```

## Environment Management

### Environment Detection

```typescript
import { getCurrentEnvironment } from '@nextsaas/config';

const env = getCurrentEnvironment();
console.log(`Running in ${env} mode`);

// Manual environment switching
const manager = new ConfigManager();
await manager.switchEnvironment('staging');
```

### Environment-Specific Logic

```typescript
import { config } from '@nextsaas/config';

function getApiEndpoint() {
  const env = config.env();
  
  switch (env.NODE_ENV) {
    case 'production':
      return 'https://api.myapp.com';
    case 'staging':
      return 'https://staging-api.myapp.com';
    default:
      return 'http://localhost:3001';
  }
}
```

### Loading Environment Files

```typescript
import { loadConfig } from '@nextsaas/config';
import { config } from 'dotenv';

// Load .env file first
config({ path: `.env.${process.env.NODE_ENV}` });

// Then load configuration
const result = await loadConfig();
```

## Secret Management

### Generating Secrets

```typescript
import { 
  generateSecureSecret,
  generateApiKey,
  generateSecureUUID 
} from '@nextsaas/config';

// Generate a secure JWT secret
const jwtSecret = generateSecureSecret(64);

// Generate API keys
const apiKey = generateApiKey('sk_live', 32);
const webhookSecret = generateApiKey('whsec', 48);

// Generate unique IDs
const sessionId = generateSecureUUID();
```

### Validating Secrets

```typescript
import { validateSecretStrength } from '@nextsaas/config';

function validateUserPassword(password: string) {
  const result = validateSecretStrength(password);
  
  if (!result.valid) {
    throw new Error(`Weak password: ${result.errors.join(', ')}`);
  }
  
  console.log(`Password strength: ${result.strength} (${result.score}/100)`);
  
  if (result.suggestions.length > 0) {
    console.log('Suggestions:', result.suggestions);
  }
}
```

### Encrypting Configuration

```typescript
import { encryptValue, decryptValue } from '@nextsaas/config';

// Encrypt sensitive data
const encryptionKey = process.env.ENCRYPTION_KEY!;
const encrypted = encryptValue(sensitiveData, encryptionKey);

// Store encrypted data
await saveToDatabase({
  data: encrypted.encrypted,
  iv: encrypted.iv,
  tag: encrypted.tag,
  salt: encrypted.salt,
});

// Decrypt when needed
const decrypted = decryptValue({
  encrypted: stored.data,
  iv: stored.iv,
  tag: stored.tag,
  salt: stored.salt,
  key: encryptionKey,
});
```

### External Secret Stores

```typescript
import { 
  SecretManager,
  createSecretProvider 
} from '@nextsaas/config';

// Create providers
const providers = [
  createSecretProvider({ 
    provider: 'aws-secrets-manager',
    region: 'us-east-1' 
  }),
  createSecretProvider({ 
    provider: 'file',
    filePath: './secrets.json' 
  }),
  createSecretProvider({ 
    provider: 'env' 
  }),
];

// Create manager with fallback
const secretManager = new SecretManager(providers);

// Get secrets
const dbPassword = await secretManager.getSecretValue('DB_PASSWORD');
const apiKeys = await secretManager.getSecret('API_KEYS');

// Rotate secrets
const newSecret = await secretManager.rotateSecret('JWT_SECRET');
```

## Advanced Patterns

### Configuration Middleware

```typescript
import { ConfigManager } from '@nextsaas/config';

const manager = new ConfigManager();

// Add validation middleware
manager.use((config, env) => {
  if (env === 'production' && !config.database.ssl?.enabled) {
    throw new Error('SSL must be enabled in production');
  }
  return config;
});

// Add transformation middleware
manager.use((config, env) => {
  // Add computed values
  config.app.apiUrl = config.app.apiUrl || `${config.app.url}/api`;
  return config;
});

// Add async middleware
manager.use(async (config, env) => {
  // Fetch remote configuration
  const remoteConfig = await fetchRemoteConfig();
  return { ...config, ...remoteConfig };
});
```

### Configuration Watching

```typescript
import { ConfigManager } from '@nextsaas/config';

const manager = new ConfigManager();

// Watch for changes
manager.watch((event) => {
  console.log('Configuration changed:', {
    environment: event.environment,
    changes: event.changes,
    timestamp: event.timestamp,
  });
  
  // Reload services
  reloadDatabase();
  reloadCache();
});

// Trigger reload
await manager.reload();
```

### Custom Configuration Sources

```typescript
import { loadConfig } from '@nextsaas/config';

// Load from custom sources
async function loadCustomConfig() {
  // Fetch from API
  const apiConfig = await fetch('/api/config').then(r => r.json());
  
  // Load from file
  const fileConfig = JSON.parse(
    await fs.readFile('./config.json', 'utf8')
  );
  
  // Merge with environment
  const result = await loadConfig({
    envVars: {
      ...process.env,
      ...apiConfig,
      ...fileConfig,
    },
  });
  
  return result;
}
```

### Lazy Configuration Loading

```typescript
import { ConfigManager } from '@nextsaas/config';

class LazyConfigService {
  private config?: ConfigManager;
  
  async getConfig(): Promise<ConfigManager> {
    if (!this.config) {
      this.config = new ConfigManager();
      await this.config.initialize();
    }
    return this.config;
  }
  
  async getDatabaseUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.get('database.url');
  }
}
```

## Best Practices

### 1. Initialize Early

```typescript
// main.ts
import { initializeGlobalConfig } from '@nextsaas/config';

async function main() {
  try {
    // Initialize config first
    await initializeGlobalConfig();
    
    // Then start services
    await startDatabase();
    await startServer();
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
}
```

### 2. Validate in CI/CD

```yaml
# .github/workflows/validate.yml
- name: Validate Configuration
  run: |
    npm run validate -- --env production
    npm run validate -- --env staging
```

### 3. Use Type Guards

```typescript
import { config } from '@nextsaas/config';

function requireDatabaseUrl(): string {
  const url = config.database().url;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  return url;
}

function requireFeature(feature: string): void {
  if (!config.feature(feature as any)) {
    throw new Error(`Feature ${feature} is not enabled`);
  }
}
```

### 4. Environment-Specific Defaults

```typescript
import { developmentConfig, productionConfig } from '@nextsaas/config';

const config = process.env.NODE_ENV === 'production'
  ? {
      ...productionConfig,
      // Production overrides
      monitoring: {
        ...productionConfig.monitoring,
        alerting: { enabled: true },
      },
    }
  : {
      ...developmentConfig,
      // Development overrides
      database: {
        ...developmentConfig.database,
        logging: { enabled: true, queries: true },
      },
    };
```

### 5. Secure Secret Handling

```typescript
import { sanitizeEnvVars, validateEnvSecurity } from '@nextsaas/config';

// Log configuration safely
function logConfig(config: any) {
  const sanitized = sanitizeEnvVars(process.env);
  console.log('Environment:', sanitized);
}

// Validate security before deployment
async function validateSecurity() {
  const result = validateEnvSecurity(process.env);
  
  if (!result.secure) {
    console.error('Security issues:', result.vulnerabilities);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
```

### 6. Testing Configuration

```typescript
import { loadConfig } from '@nextsaas/config';

describe('Application Config', () => {
  it('should load test configuration', async () => {
    const result = await loadConfig({ 
      environment: 'test',
      envVars: {
        DATABASE_URL: 'sqlite:///:memory:',
      },
    });
    
    expect(result.config.database.provider).toBe('sqlite');
    expect(result.validationErrors).toHaveLength(0);
  });
  
  it('should require production variables', async () => {
    const result = await loadConfig({
      environment: 'production',
      envVars: {}, // Missing required vars
    });
    
    expect(result.missingEnvVars).toContain('DATABASE_URL');
    expect(result.missingEnvVars).toContain('JWT_SECRET');
  });
});
```

## Next Steps

- Review the [API Reference](./api-reference.md)
- Check out [Configuration Examples](./examples.md)
- Learn about [Security Best Practices](./security.md)
- Explore [Integration Guides](./integrations.md)