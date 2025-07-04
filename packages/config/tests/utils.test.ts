import { describe, it, expect } from 'vitest';
import {
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
  type EnvVarDefinition,
} from '../src/utils';

describe('Configuration Utilities', () => {
  describe('validateEnvVar', () => {
    it('should validate string environment variable', () => {
      const def: EnvVarDefinition = {
        name: 'APP_NAME',
        type: 'string',
        required: true,
      };
      
      const result = validateEnvVar(def, 'My App');
      expect(result.valid).toBe(true);
      expect(result.parsedValue).toBe('My App');
    });

    it('should validate number environment variable', () => {
      const def: EnvVarDefinition = {
        name: 'PORT',
        type: 'number',
        required: true,
      };
      
      const result = validateEnvVar(def, '3000');
      expect(result.valid).toBe(true);
      expect(result.parsedValue).toBe(3000);
    });

    it('should validate boolean environment variable', () => {
      const def: EnvVarDefinition = {
        name: 'DEBUG',
        type: 'boolean',
        required: false,
      };
      
      const resultTrue = validateEnvVar(def, 'true');
      expect(resultTrue.valid).toBe(true);
      expect(resultTrue.parsedValue).toBe(true);
      
      const resultFalse = validateEnvVar(def, 'false');
      expect(resultFalse.valid).toBe(true);
      expect(resultFalse.parsedValue).toBe(false);
    });

    it('should validate array environment variable', () => {
      const def: EnvVarDefinition = {
        name: 'ALLOWED_ORIGINS',
        type: 'array',
        required: false,
      };
      
      const result = validateEnvVar(def, 'http://localhost:3000,https://example.com');
      expect(result.valid).toBe(true);
      expect(result.parsedValue).toEqual(['http://localhost:3000', 'https://example.com']);
    });

    it('should validate JSON environment variable', () => {
      const def: EnvVarDefinition = {
        name: 'CONFIG_JSON',
        type: 'json',
        required: false,
      };
      
      const result = validateEnvVar(def, '{"key":"value","num":123}');
      expect(result.valid).toBe(true);
      expect(result.parsedValue).toEqual({ key: 'value', num: 123 });
    });

    it('should fail validation for required missing variable', () => {
      const def: EnvVarDefinition = {
        name: 'REQUIRED_VAR',
        type: 'string',
        required: true,
      };
      
      const result = validateEnvVar(def, '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Required environment variable');
    });

    it('should use default value when not provided', () => {
      const def: EnvVarDefinition = {
        name: 'OPTIONAL_VAR',
        type: 'string',
        required: false,
        default: 'default-value',
      };
      
      const result = validateEnvVar(def, undefined);
      expect(result.valid).toBe(true);
      expect(result.parsedValue).toBe('default-value');
    });

    it('should run custom validation', () => {
      const def: EnvVarDefinition = {
        name: 'CUSTOM_VAR',
        type: 'number',
        required: true,
        validation: (value: number) => value >= 1000 && value <= 9999,
      };
      
      const validResult = validateEnvVar(def, '3000');
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validateEnvVar(def, '100');
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('validateEnvVars', () => {
    it('should validate multiple environment variables', () => {
      const definitions: EnvVarDefinition[] = [
        { name: 'APP_NAME', type: 'string', required: true },
        { name: 'PORT', type: 'number', required: true },
        { name: 'DEBUG', type: 'boolean', required: false, default: false },
      ];
      
      const envVars = {
        APP_NAME: 'Test App',
        PORT: '3000',
      };
      
      const result = validateEnvVars(definitions, envVars);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.parsedValues).toEqual({
        APP_NAME: 'Test App',
        PORT: 3000,
        DEBUG: false,
      });
    });

    it('should collect all validation errors', () => {
      const definitions: EnvVarDefinition[] = [
        { name: 'REQUIRED1', type: 'string', required: true },
        { name: 'REQUIRED2', type: 'number', required: true },
      ];
      
      const result = validateEnvVars(definitions, {});
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('generateEnvVarDefinitions', () => {
    it('should generate definitions for development', () => {
      const definitions = generateEnvVarDefinitions('development');
      
      expect(definitions.length).toBeGreaterThan(0);
      expect(definitions.some(d => d.name === 'NODE_ENV')).toBe(true);
      expect(definitions.some(d => d.name === 'DATABASE_URL')).toBe(true);
      expect(definitions.some(d => d.name === 'JWT_SECRET')).toBe(true);
    });

    it('should mark production required variables', () => {
      const definitions = generateEnvVarDefinitions('production');
      
      const appUrl = definitions.find(d => d.name === 'APP_URL');
      expect(appUrl?.required).toBe(true);
      
      const jwtSecret = definitions.find(d => d.name === 'JWT_SECRET');
      expect(jwtSecret?.required).toBe(true);
    });

    it('should mark test optional variables', () => {
      const definitions = generateEnvVarDefinitions('test');
      
      const dbUrl = definitions.find(d => d.name === 'DATABASE_URL');
      expect(dbUrl?.required).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone('string')).toBe('string');
      expect(deepClone(123)).toBe(123);
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
    });

    it('should clone objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('should clone arrays', () => {
      const arr = [1, { a: 2 }, [3, 4]];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    it('should clone dates', () => {
      const date = new Date('2024-01-01');
      const cloned = deepClone(date);
      
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
      expect(cloned instanceof Date).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('  ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('should detect non-empty values', () => {
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('sanitizeConfig', () => {
    it('should redact sensitive configuration fields', () => {
      const config = {
        database: {
          url: 'postgresql://user:pass@localhost:5432/db',
          password: 'db-password',
        },
        auth: {
          jwt: {
            secret: 'jwt-secret-key',
          },
          session: {
            secret: 'session-secret-key',
          },
        },
        email: {
          sendgrid: {
            apiKey: 'SG.api-key',
          },
        },
        app: {
          name: 'Test App',
          url: 'http://localhost:3000',
        },
      };
      
      const sanitized = sanitizeConfig(config as any);
      
      expect(sanitized.database?.url).toBe('***REDACTED***');
      expect(sanitized.database?.password).toBe('***REDACTED***');
      expect(sanitized.auth?.jwt?.secret).toBe('***REDACTED***');
      expect(sanitized.auth?.session?.secret).toBe('***REDACTED***');
      expect(sanitized.email?.sendgrid?.apiKey).toBe('***REDACTED***');
      expect(sanitized.app?.name).toBe('Test App');
      expect(sanitized.app?.url).toBe('http://localhost:3000');
    });
  });

  describe('getConfigSummary', () => {
    it('should generate configuration summary', () => {
      const config = {
        env: { NODE_ENV: 'production' },
        features: {
          authentication: true,
          billing: true,
          multiTenant: false,
        },
        database: { provider: 'postgresql' },
        email: { provider: 'sendgrid' },
        storage: { provider: 'aws-s3' },
        billing: { provider: 'stripe' },
        cache: { redis: { enabled: true } },
        security: {
          cors: { enabled: true },
          rateLimit: { enabled: true },
          csp: { enabled: false },
          https: { enforced: true },
        },
      };
      
      const summary = getConfigSummary(config as any);
      
      expect(summary.environment).toBe('production');
      expect(summary.features.authentication).toBe(true);
      expect(summary.features.multiTenant).toBe(false);
      expect(summary.services.database).toBe('postgresql');
      expect(summary.services.cache).toBe('redis');
      expect(summary.security.cors).toBe(true);
      expect(summary.security.csp).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://sub.example.com:8080/path')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('generateRandomString', () => {
    it('should generate random string of specified length', () => {
      const str = generateRandomString(16);
      expect(str).toHaveLength(16);
      expect(/^[A-Za-z0-9]+$/.test(str)).toBe(true);
    });

    it('should generate unique strings', () => {
      const str1 = generateRandomString(16);
      const str2 = generateRandomString(16);
      expect(str1).not.toBe(str2);
    });
  });

  describe('formatConfigForDisplay', () => {
    it('should format and sanitize configuration', () => {
      const config = {
        app: { name: 'Test' },
        auth: { jwt: { secret: 'secret-key' } },
      };
      
      const formatted = formatConfigForDisplay(config as any);
      const parsed = JSON.parse(formatted);
      
      expect(parsed.app.name).toBe('Test');
      expect(parsed.auth.jwt.secret).toBe('***REDACTED***');
    });
  });
});