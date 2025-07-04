import { describe, it, expect } from 'vitest';
import {
  authConfigSchema,
  billingConfigSchema,
  databaseConfigSchema,
  emailConfigSchema,
  integrationsConfigSchema,
  monitoringConfigSchema,
  storageConfigSchema,
} from '../src/schemas';

describe('Configuration Schemas', () => {
  describe('Database Schema', () => {
    it('should validate valid PostgreSQL configuration', () => {
      const config = {
        provider: 'postgresql',
        url: 'postgresql://user:pass@localhost:5432/db',
        pool: {
          min: 2,
          max: 10,
        },
      };
      
      const result = databaseConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate MySQL configuration', () => {
      const config = {
        provider: 'mysql',
        url: 'mysql://user:pass@localhost:3306/db',
      };
      
      const result = databaseConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject invalid database URL', () => {
      const config = {
        provider: 'postgresql',
        url: 'not-a-valid-url',
      };
      
      const result = databaseConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should apply default values', () => {
      const config = {
        provider: 'postgresql',
        url: 'postgresql://localhost:5432/db',
      };
      
      const result = databaseConfigSchema.parse(config);
      expect(result.pool.min).toBe(2);
      expect(result.pool.max).toBe(10);
      expect(result.logging.enabled).toBe(false);
    });
  });

  describe('Auth Schema', () => {
    it('should validate JWT configuration', () => {
      const config = {
        jwt: {
          secret: 'super-secret-key-at-least-32-characters-long',
          expiresIn: '24h',
          algorithm: 'HS256',
        },
      };
      
      const result = authConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate session configuration', () => {
      const config = {
        session: {
          provider: 'redis',
          secret: 'session-secret-key-at-least-32-characters',
          maxAge: 86400,
        },
      };
      
      const result = authConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate password policy', () => {
      const config = {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          maxAttempts: 5,
        },
      };
      
      const result = authConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject weak JWT secret', () => {
      const config = {
        jwt: {
          secret: 'short', // Too short
          expiresIn: '24h',
        },
      };
      
      const result = authConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });

  describe('Email Schema', () => {
    it('should validate SMTP configuration', () => {
      const config = {
        provider: 'smtp',
        smtp: {
          host: 'smtp.example.com',
          port: 587,
          secure: false,
          auth: {
            user: 'user',
            pass: 'pass',
          },
        },
        sender: {
          name: 'Test App',
          email: 'noreply@example.com',
        },
      };
      
      const result = emailConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate SendGrid configuration', () => {
      const config = {
        provider: 'sendgrid',
        sendgrid: {
          apiKey: 'SG.test-api-key',
        },
        sender: {
          email: 'test@example.com',
        },
      };
      
      const result = emailConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const config = {
        provider: 'smtp',
        sender: {
          email: 'not-an-email',
        },
      };
      
      const result = emailConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });

  describe('Storage Schema', () => {
    it('should validate local storage configuration', () => {
      const config = {
        provider: 'local',
        local: {
          uploadPath: './uploads',
          publicPath: '/uploads',
        },
      };
      
      const result = storageConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate AWS S3 configuration', () => {
      const config = {
        provider: 'aws-s3',
        awsS3: {
          accessKeyId: 'AKIAXXXXXXXXXXXXXXXX',
          secretAccessKey: 'secret-key',
          region: 'us-east-1',
          bucket: 'my-bucket',
        },
      };
      
      const result = storageConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate upload limits', () => {
      const config = {
        provider: 'local',
        uploads: {
          maxFileSize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          allowedTypes: ['image/jpeg', 'image/png'],
        },
      };
      
      const result = storageConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('Billing Schema', () => {
    it('should validate Stripe configuration', () => {
      const config = {
        provider: 'stripe',
        testMode: false,
        stripe: {
          publishableKey: 'pk_live_test',
          secretKey: 'sk_live_test',
          webhookSecret: 'whsec_test',
          apiVersion: '2023-10-16',
        },
      };
      
      const result = billingConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate subscription plans', () => {
      const config = {
        provider: 'stripe',
        plans: [
          {
            id: 'basic',
            name: 'Basic Plan',
            currency: 'usd',
            interval: 'month',
            amount: 999,
          },
          {
            id: 'pro',
            name: 'Pro Plan',
            currency: 'usd',
            interval: 'month',
            amount: 2999,
          },
        ],
      };
      
      const result = billingConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate currencies', () => {
      const config = {
        provider: 'stripe',
        currencies: ['usd', 'eur', 'gbp'],
      };
      
      const result = billingConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('Integrations Schema', () => {
    it('should validate analytics integrations', () => {
      const config = {
        analytics: {
          googleAnalytics: {
            enabled: true,
            measurementId: 'G-XXXXXXXXXX',
          },
          plausible: {
            enabled: true,
            domain: 'example.com',
          },
        },
      };
      
      const result = integrationsConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate development integrations', () => {
      const config = {
        development: {
          sentry: {
            enabled: true,
            dsn: 'https://xxx@sentry.io/12345',
            environment: 'production',
            sampleRate: 0.1,
          },
        },
      };
      
      const result = integrationsConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate communication integrations', () => {
      const config = {
        communication: {
          slack: {
            enabled: true,
            webhookUrl: 'https://hooks.slack.com/services/XXX/YYY/ZZZ',
            channels: {
              alerts: '#alerts',
              errors: '#errors',
            },
          },
        },
      };
      
      const result = integrationsConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('Monitoring Schema', () => {
    it('should validate logging configuration', () => {
      const config = {
        enabled: true,
        logging: {
          enabled: true,
          level: 'info',
          console: {
            enabled: true,
            format: 'json',
          },
          file: {
            enabled: true,
            filename: './logs/app.log',
            maxSize: '10m',
          },
        },
      };
      
      const result = monitoringConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate metrics configuration', () => {
      const config = {
        metrics: {
          enabled: true,
          provider: 'prometheus',
          prometheus: {
            port: 9090,
            path: '/metrics',
          },
        },
      };
      
      const result = monitoringConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate health check configuration', () => {
      const config = {
        healthChecks: {
          enabled: true,
          path: '/health',
          interval: 30000,
          timeout: 5000,
          checks: {
            database: true,
            redis: true,
            storage: true,
          },
        },
      };
      
      const result = monitoringConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('Schema Defaults', () => {
    it('should apply development defaults', () => {
      const { developmentDatabaseDefaults } = require('../src/schemas/database');
      expect(developmentDatabaseDefaults.logging.enabled).toBe(true);
      expect(developmentDatabaseDefaults.ssl.enabled).toBe(false);
    });

    it('should apply production defaults', () => {
      const { productionDatabaseDefaults } = require('../src/schemas/database');
      expect(productionDatabaseDefaults.logging.enabled).toBe(false);
      expect(productionDatabaseDefaults.ssl.enabled).toBe(true);
    });

    it('should apply test defaults', () => {
      const { testDatabaseDefaults } = require('../src/schemas/database');
      expect(testDatabaseDefaults.provider).toBe('sqlite');
      expect(testDatabaseDefaults.logging.enabled).toBe(false);
    });
  });
});