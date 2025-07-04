import { describe, it, expect } from 'vitest';
import {
  generateSecureSecret,
  generateApiKey,
  generateSecureUUID,
  generateSecureHash,
  validateSecretStrength,
  encryptValue,
  decryptValue,
  secureCompare,
  hashPassword,
  verifyPassword,
  sanitizeEnvVars,
  validateEnvSecurity,
  generateSecureConfigTemplate,
} from '../src/security';

describe('Security Utilities', () => {
  describe('generateSecureSecret', () => {
    it('should generate secret of specified length', () => {
      const secret = generateSecureSecret(32);
      expect(secret).toHaveLength(32);
    });

    it('should generate unique secrets', () => {
      const secret1 = generateSecureSecret(32);
      const secret2 = generateSecureSecret(32);
      expect(secret1).not.toBe(secret2);
    });

    it('should use custom charset when provided', () => {
      const secret = generateSecureSecret(10, '0123456789');
      expect(/^[0-9]+$/.test(secret)).toBe(true);
    });
  });

  describe('generateApiKey', () => {
    it('should generate API key with prefix', () => {
      const apiKey = generateApiKey('sk', 32);
      expect(apiKey).toMatch(/^sk_[A-Za-z0-9]{32}$/);
    });

    it('should generate unique API keys', () => {
      const key1 = generateApiKey('pk', 24);
      const key2 = generateApiKey('pk', 24);
      expect(key1).not.toBe(key2);
    });
  });

  describe('generateSecureUUID', () => {
    it('should generate valid UUID v4', () => {
      const uuid = generateSecureUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(uuid)).toBe(true);
    });
  });

  describe('generateSecureHash', () => {
    it('should generate consistent hash for same value and salt', () => {
      const value = 'test-value';
      const salt = 'fixed-salt';
      
      const hash1 = generateSecureHash(value, salt);
      const hash2 = generateSecureHash(value, salt);
      
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different values', () => {
      const salt = 'fixed-salt';
      const hash1 = generateSecureHash('value1', salt);
      const hash2 = generateSecureHash('value2', salt);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes with different salts', () => {
      const value = 'test-value';
      const hash1 = generateSecureHash(value, 'salt1');
      const hash2 = generateSecureHash(value, 'salt2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('validateSecretStrength', () => {
    it('should validate strong secrets', () => {
      const result = validateSecretStrength('SuperStr0ng!P@ssw0rd#2024');
      
      expect(result.valid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.score).toBeGreaterThan(80);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect weak secrets', () => {
      const result = validateSecretStrength('password');
      
      expect(result.valid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect common patterns', () => {
      const result = validateSecretStrength('password123456');
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('common patterns'))).toBe(true);
    });

    it('should require minimum length', () => {
      const result = validateSecretStrength('Sh0rt!');
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('at least 8 characters'))).toBe(true);
    });

    it('should check character variety', () => {
      const result = validateSecretStrength('onlylowercase');
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('character types'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('uppercase'))).toBe(true);
    });
  });

  describe('encryptValue and decryptValue', () => {
    it('should encrypt and decrypt values correctly', () => {
      const value = 'sensitive-data';
      const key = 'encryption-key-32-characters-long';
      
      const encrypted = encryptValue(value, key);
      expect(encrypted.encrypted).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.tag).toBeTruthy();
      expect(encrypted.salt).toBeTruthy();
      
      const decrypted = decryptValue({
        ...encrypted,
        key,
      });
      
      expect(decrypted).toBe(value);
    });

    it('should fail decryption with wrong key', () => {
      const value = 'sensitive-data';
      const key = 'correct-key-32-characters-long!!';
      const wrongKey = 'wrong-key-32-characters-long!!!!';
      
      const encrypted = encryptValue(value, key);
      
      expect(() => {
        decryptValue({
          ...encrypted,
          key: wrongKey,
        });
      }).toThrow();
    });
  });

  describe('secureCompare', () => {
    it('should return true for equal strings', () => {
      expect(secureCompare('secret123', 'secret123')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(secureCompare('secret123', 'secret124')).toBe(false);
    });

    it('should return false for different lengths', () => {
      expect(secureCompare('short', 'longer')).toBe(false);
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('should hash and verify passwords correctly', () => {
      const password = 'MySecureP@ssw0rd!';
      const hash = hashPassword(password);
      
      expect(hash).toMatch(/^\$pbkdf2\$\d+\$/);
      expect(verifyPassword(password, hash)).toBe(true);
    });

    it('should reject wrong password', () => {
      const password = 'MySecureP@ssw0rd!';
      const wrongPassword = 'WrongP@ssw0rd!';
      const hash = hashPassword(password);
      
      expect(verifyPassword(wrongPassword, hash)).toBe(false);
    });

    it('should generate different hashes for same password', () => {
      const password = 'MySecureP@ssw0rd!';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
      expect(verifyPassword(password, hash1)).toBe(true);
      expect(verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('sanitizeEnvVars', () => {
    it('should mask sensitive environment variables', () => {
      const envVars = {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'super-secret-jwt-key-value',
        API_KEY: 'sk_test_1234567890abcdef',
        STRIPE_WEBHOOK_SECRET: 'whsec_1234567890',
        APP_NAME: 'My App',
      };
      
      const sanitized = sanitizeEnvVars(envVars);
      
      expect(sanitized.NODE_ENV).toBe('production');
      expect(sanitized.APP_NAME).toBe('My App');
      expect(sanitized.DATABASE_URL).not.toBe(envVars.DATABASE_URL);
      expect(sanitized.JWT_SECRET).toMatch(/^\*+$/);
      expect(sanitized.API_KEY).toMatch(/^sk_t\*+cdef$/);
    });

    it('should handle empty or missing values', () => {
      const envVars = {
        EMPTY_SECRET: '',
        MISSING_SECRET: undefined as any,
      };
      
      const sanitized = sanitizeEnvVars(envVars);
      
      expect(sanitized.EMPTY_SECRET).toBe('***MASKED***');
      expect(sanitized.MISSING_SECRET).toBe('***MASKED***');
    });
  });

  describe('validateEnvSecurity', () => {
    it('should validate secure environment configuration', () => {
      const envVars = {
        JWT_SECRET: generateSecureSecret(64),
        SESSION_SECRET: generateSecureSecret(64),
        DATABASE_URL: 'postgresql://user:pass@prod-db:5432/app',
      };
      
      const result = validateEnvSecurity(envVars);
      
      expect(result.secure).toBe(true);
      expect(result.vulnerabilities).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should detect weak secrets', () => {
      const envVars = {
        JWT_SECRET: 'weak-secret',
        SESSION_SECRET: 'password123',
      };
      
      const result = validateEnvSecurity(envVars);
      
      expect(result.secure).toBe(false);
      expect(result.vulnerabilities.some(v => v.includes('weak/common values'))).toBe(true);
      expect(result.score).toBeLessThan(80);
    });

    it('should detect missing required secrets', () => {
      const envVars = {
        DATABASE_URL: 'postgresql://localhost:5432/app',
      };
      
      const result = validateEnvSecurity(envVars);
      
      expect(result.secure).toBe(false);
      expect(result.vulnerabilities.some(v => v.includes('Missing required secret'))).toBe(true);
    });

    it('should detect development values in production', () => {
      process.env.NODE_ENV = 'production';
      
      const envVars = {
        JWT_SECRET: 'dev-secret-for-testing-only',
        DATABASE_URL: 'postgresql://localhost:5432/test-db',
      };
      
      const result = validateEnvSecurity(envVars);
      
      expect(result.secure).toBe(false);
      expect(result.vulnerabilities.some(v => v.includes('development values in production'))).toBe(true);
      
      delete process.env.NODE_ENV;
    });
  });

  describe('generateSecureConfigTemplate', () => {
    it('should generate development template with actual secrets', () => {
      const template = generateSecureConfigTemplate('development');
      
      expect(template.JWT_SECRET).toHaveLength(64);
      expect(template.SESSION_SECRET).toHaveLength(64);
      expect(template.API_KEY).toMatch(/^sk_/);
      expect(template.DATABASE_URL).toContain('localhost');
    });

    it('should generate production template with placeholders', () => {
      const template = generateSecureConfigTemplate('production');
      
      expect(template.JWT_SECRET).toContain('Use AWS Secrets Manager');
      expect(template.SESSION_SECRET).toContain('Use AWS Secrets Manager');
      expect(template.DATABASE_URL).toContain('Set your production');
    });

    it('should generate unique secrets each time', () => {
      const template1 = generateSecureConfigTemplate('development');
      const template2 = generateSecureConfigTemplate('development');
      
      expect(template1.JWT_SECRET).not.toBe(template2.JWT_SECRET);
      expect(template1.API_KEY).not.toBe(template2.API_KEY);
    });
  });
});