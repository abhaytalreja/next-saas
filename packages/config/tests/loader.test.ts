import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig, validateConfig, clearConfigCache, getCurrentEnvironment, exportConfig } from '../src/loader';
import { Environment } from '../src/loader';

describe('Configuration Loader', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  afterEach(() => {
    clearConfigCache();
    // Reset environment variables
    delete process.env.NODE_ENV;
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
  });

  describe('getCurrentEnvironment', () => {
    it('should return current environment from NODE_ENV', () => {
      process.env.NODE_ENV = 'production';
      expect(getCurrentEnvironment()).toBe('production');
    });

    it('should default to development if NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      expect(getCurrentEnvironment()).toBe('development');
    });

    it('should default to development for invalid NODE_ENV', () => {
      process.env.NODE_ENV = 'invalid';
      expect(getCurrentEnvironment()).toBe('development');
    });
  });

  describe('loadConfig', () => {
    it('should load development configuration by default', async () => {
      const result = await loadConfig();
      expect(result.environment).toBe('development');
      expect(result.config.env.NODE_ENV).toBe('development');
    });

    it('should load production configuration when specified', async () => {
      const result = await loadConfig({ environment: 'production' });
      expect(result.environment).toBe('production');
      expect(result.config.env.NODE_ENV).toBe('production');
    });

    it('should merge environment variables with configuration', async () => {
      const testUrl = 'postgresql://test:password@localhost:5432/test_db';
      const result = await loadConfig({
        envVars: {
          DATABASE_URL: testUrl,
          JWT_SECRET: 'test-secret-key',
        },
      });
      expect(result.config.database.url).toBe(testUrl);
      expect(result.config.auth.jwt.secret).toBe('test-secret-key');
    });

    it('should report missing required environment variables', async () => {
      const result = await loadConfig({
        environment: 'production',
        envVars: {}, // Empty env vars
      });
      expect(result.missingEnvVars).toContain('DATABASE_URL');
      expect(result.missingEnvVars).toContain('JWT_SECRET');
    });

    it('should handle validation errors gracefully when throwOnError is false', async () => {
      const result = await loadConfig({
        environment: 'development',
        envVars: {
          PORT: 'invalid-port', // Should be a number
        },
        throwOnError: false,
      });
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });

    it('should throw error when throwOnError is true and validation fails', async () => {
      await expect(
        loadConfig({
          environment: 'production',
          envVars: {}, // Missing required vars
          throwOnError: true,
        })
      ).rejects.toThrow();
    });

    it('should cache configuration for the same environment', async () => {
      const result1 = await loadConfig({ environment: 'development' });
      const result2 = await loadConfig({ environment: 'development' });
      expect(result1.config).toBe(result2.config); // Same object reference
    });

    it('should not cache configuration for different environments', async () => {
      const result1 = await loadConfig({ environment: 'development' });
      const result2 = await loadConfig({ environment: 'staging' });
      expect(result1.config).not.toBe(result2.config);
      expect(result1.config.env.NODE_ENV).toBe('development');
      expect(result2.config.env.NODE_ENV).toBe('staging');
    });
  });

  describe('validateConfig', () => {
    it('should validate valid configuration', async () => {
      const validConfig = {
        app: {
          name: 'Test App',
          url: 'http://localhost:3000',
          supportEmail: 'test@example.com',
        },
        env: {
          NODE_ENV: 'development',
          PORT: 3000,
        },
        features: {
          authentication: true,
          billing: false,
        },
        database: {
          provider: 'postgresql',
          url: 'postgresql://localhost:5432/test',
        },
        auth: {
          jwt: {
            secret: 'test-secret',
            expiresIn: '24h',
          },
        },
        email: {
          provider: 'smtp',
          sender: {
            email: 'test@example.com',
          },
        },
        storage: {
          provider: 'local',
        },
        billing: {
          provider: 'stripe',
          testMode: true,
        },
        integrations: {},
        monitoring: {
          enabled: false,
        },
      };

      const result = await validateConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid configuration', async () => {
      const invalidConfig = {
        app: {
          name: 'Test App',
          url: 'not-a-valid-url', // Invalid URL
          supportEmail: 'not-an-email', // Invalid email
        },
      };

      const result = await validateConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect missing required fields', async () => {
      const incompleteConfig = {
        app: {
          name: 'Test App',
        },
        // Missing required sections
      };

      const result = await validateConfig(incompleteConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('exportConfig', () => {
    it('should export configuration as JSON', async () => {
      const json = await exportConfig('development', 'json');
      const parsed = JSON.parse(json);
      expect(parsed.env.NODE_ENV).toBe('development');
    });

    it('should export environment variables', async () => {
      const envVars = await exportConfig('development', 'env');
      expect(envVars).toContain('NODE_ENV=development');
      expect(envVars).toContain('PORT=3000');
    });

    it('should throw error for unsupported format', async () => {
      await expect(
        exportConfig('development', 'yaml')
      ).rejects.toThrow('YAML export not implemented');
    });
  });

  describe('Environment-specific defaults', () => {
    it('should have development-friendly defaults in development', async () => {
      const result = await loadConfig({ environment: 'development' });
      const config = result.config;
      
      expect(config.security.cors.enabled).toBe(true);
      expect(config.security.rateLimit.enabled).toBe(false);
      expect(config.security.https.enforced).toBe(false);
      expect(config.env.DEBUG).toBe(true);
    });

    it('should have production-ready defaults in production', async () => {
      const result = await loadConfig({ environment: 'production' });
      const config = result.config;
      
      expect(config.security.cors.enabled).toBe(true);
      expect(config.security.rateLimit.enabled).toBe(true);
      expect(config.security.https.enforced).toBe(true);
      expect(config.env.DEBUG).toBe(false);
    });

    it('should have test-optimized defaults in test', async () => {
      const result = await loadConfig({ environment: 'test' });
      const config = result.config;
      
      expect(config.cache.enabled).toBe(false);
      expect(config.monitoring.enabled).toBe(false);
      expect(config.database.provider).toBe('sqlite');
    });
  });
});