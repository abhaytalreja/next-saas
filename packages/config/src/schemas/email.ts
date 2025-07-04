import { z } from 'zod';

/**
 * Email Configuration Schema
 * 
 * Validates email service settings including:
 * - SMTP configuration
 * - Email service providers (SendGrid, Mailgun, etc.)
 * - Template management
 * - Queue and retry settings
 * - Monitoring and analytics
 */

// Email provider enum
export const EmailProvider = z.enum([
  'smtp',
  'sendgrid',
  'mailgun',
  'postmark',
  'aws-ses',
  'mandrill',
  'mailchimp',
  'resend'
]);

// SMTP configuration schema
const smtpConfigSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().int().min(1).max(65535).default(587),
  secure: z.boolean().default(false),
  auth: z.object({
    user: z.string().min(1, 'SMTP username is required'),
    pass: z.string().min(1, 'SMTP password is required'),
  }),
  tls: z.object({
    rejectUnauthorized: z.boolean().default(true),
    ciphers: z.string().optional(),
    minVersion: z.string().optional(),
  }).optional(),
}).describe('SMTP server configuration');

// SendGrid configuration schema
const sendGridConfigSchema = z.object({
  apiKey: z.string().min(1, 'SendGrid API key is required'),
  sandboxMode: z.boolean().default(false),
}).describe('SendGrid service configuration');

// Mailgun configuration schema
const mailgunConfigSchema = z.object({
  apiKey: z.string().min(1, 'Mailgun API key is required'),
  domain: z.string().min(1, 'Mailgun domain is required'),
  host: z.string().default('api.mailgun.net'),
  testMode: z.boolean().default(false),
}).describe('Mailgun service configuration');

// Postmark configuration schema
const postmarkConfigSchema = z.object({
  serverToken: z.string().min(1, 'Postmark server token is required'),
  accountToken: z.string().optional(),
}).describe('Postmark service configuration');

// AWS SES configuration schema
const awsSesConfigSchema = z.object({
  accessKeyId: z.string().min(1, 'AWS access key ID is required'),
  secretAccessKey: z.string().min(1, 'AWS secret access key is required'),
  region: z.string().default('us-east-1'),
  configurationSet: z.string().optional(),
}).describe('AWS SES service configuration');

// Resend configuration schema
const resendConfigSchema = z.object({
  apiKey: z.string().min(1, 'Resend API key is required'),
}).describe('Resend service configuration');

// Email template configuration
const templateConfigSchema = z.object({
  engine: z.enum(['handlebars', 'mustache', 'ejs', 'pug']).default('handlebars'),
  directory: z.string().default('./templates/email'),
  extension: z.string().default('.hbs'),
  cache: z.boolean().default(true),
  partials: z.string().default('./templates/email/partials'),
  helpers: z.record(z.string(), z.any()).optional(),
  defaultLayout: z.string().optional(),
}).describe('Email template engine configuration');

// Queue configuration for email processing
const queueConfigSchema = z.object({
  enabled: z.boolean().default(true),
  provider: z.enum(['memory', 'redis', 'bull', 'agenda']).default('memory'),
  concurrency: z.number().int().min(1).default(5),
  retries: z.number().int().min(0).default(3),
  retryDelay: z.number().int().min(100).default(5000),
  redis: z.object({
    url: z.string().url().optional(),
    host: z.string().default('localhost'),
    port: z.number().int().min(1).max(65535).default(6379),
    password: z.string().optional(),
    db: z.number().int().min(0).default(1),
    keyPrefix: z.string().default('nextsaas:email:'),
  }).optional(),
}).describe('Email queue configuration');

// Rate limiting for email sending
const rateLimitSchema = z.object({
  enabled: z.boolean().default(true),
  maxEmailsPerMinute: z.number().int().min(1).default(60),
  maxEmailsPerHour: z.number().int().min(1).default(1000),
  maxEmailsPerDay: z.number().int().min(1).default(10000),
  perUserLimits: z.object({
    maxEmailsPerMinute: z.number().int().min(1).default(5),
    maxEmailsPerHour: z.number().int().min(1).default(50),
    maxEmailsPerDay: z.number().int().min(1).default(200),
  }).default({}),
}).describe('Email rate limiting configuration');

// Email tracking and analytics
const trackingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  openTracking: z.boolean().default(true),
  clickTracking: z.boolean().default(true),
  unsubscribeTracking: z.boolean().default(true),
  bounceTracking: z.boolean().default(true),
  spamReporting: z.boolean().default(true),
  customTrackingDomain: z.string().optional(),
}).describe('Email tracking and analytics configuration');

// Webhook configuration for email events
const webhookConfigSchema = z.object({
  enabled: z.boolean().default(false),
  url: z.string().url().optional(),
  secret: z.string().optional(),
  events: z.array(z.enum([
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'spam',
    'unsubscribed',
    'dropped'
  ])).default(['delivered', 'bounced', 'spam']),
  retries: z.number().int().min(0).default(3),
  timeout: z.number().int().min(1000).default(10000),
}).describe('Email webhook configuration');

// Default sender information
const senderConfigSchema = z.object({
  name: z.string().min(1, 'Sender name is required'),
  email: z.string().email('Valid sender email is required'),
  replyTo: z.string().email().optional(),
  organization: z.string().optional(),
}).describe('Default sender configuration');

// Main email configuration schema
export const emailConfigSchema = z.object({
  // Email provider
  provider: EmailProvider.default('smtp'),
  
  // Provider-specific configurations
  smtp: smtpConfigSchema.optional(),
  sendgrid: sendGridConfigSchema.optional(),
  mailgun: mailgunConfigSchema.optional(),
  postmark: postmarkConfigSchema.optional(),
  awsSes: awsSesConfigSchema.optional(),
  resend: resendConfigSchema.optional(),
  
  // Default sender information
  sender: senderConfigSchema,
  
  // Template configuration
  templates: templateConfigSchema.default({}),
  
  // Queue configuration
  queue: queueConfigSchema.default({}),
  
  // Rate limiting
  rateLimit: rateLimitSchema.default({}),
  
  // Tracking and analytics
  tracking: trackingConfigSchema.default({}),
  
  // Webhooks
  webhooks: webhookConfigSchema.default({}),
  
  // Email types configuration
  types: z.object({
    transactional: z.object({
      enabled: z.boolean().default(true),
      templates: z.record(z.string(), z.object({
        subject: z.string(),
        template: z.string(),
        priority: z.enum(['high', 'normal', 'low']).default('normal'),
      })).default({
        welcome: {
          subject: 'Welcome to {{appName}}!',
          template: 'welcome',
          priority: 'high',
        },
        emailVerification: {
          subject: 'Please verify your email address',
          template: 'email-verification',
          priority: 'high',
        },
        passwordReset: {
          subject: 'Reset your password',
          template: 'password-reset',
          priority: 'high',
        },
        invoiceGenerated: {
          subject: 'Your invoice is ready',
          template: 'invoice-generated',
          priority: 'normal',
        },
        paymentFailed: {
          subject: 'Payment failed - Action required',
          template: 'payment-failed',
          priority: 'high',
        },
      }),
    }).default({}),
    marketing: z.object({
      enabled: z.boolean().default(false),
      unsubscribeUrl: z.string().url().optional(),
      listId: z.string().optional(),
      trackingEnabled: z.boolean().default(true),
    }).default({}),
    notifications: z.object({
      enabled: z.boolean().default(true),
      frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).default('immediate'),
      batchSize: z.number().int().min(1).default(100),
    }).default({}),
  }).default({}),
  
  // Security settings
  security: z.object({
    dkim: z.object({
      enabled: z.boolean().default(false),
      privateKey: z.string().optional(),
      keySelector: z.string().optional(),
      domain: z.string().optional(),
    }).default({}),
    spf: z.object({
      enabled: z.boolean().default(false),
      record: z.string().optional(),
    }).default({}),
    dmarc: z.object({
      enabled: z.boolean().default(false),
      policy: z.enum(['none', 'quarantine', 'reject']).default('none'),
      record: z.string().optional(),
    }).default({}),
  }).default({}),
  
  // Development settings
  development: z.object({
    enabled: z.boolean().default(true),
    logEmails: z.boolean().default(true),
    saveToFile: z.boolean().default(false),
    fileDirectory: z.string().default('./logs/emails'),
    previewEmails: z.boolean().default(true),
    previewPort: z.number().int().min(1).max(65535).default(1080),
  }).default({}),
  
}).describe('Email service configuration settings');

// Export types
export type EmailConfig = z.infer<typeof emailConfigSchema>;
export type EmailProvider = z.infer<typeof EmailProvider>;
export type SenderConfig = z.infer<typeof senderConfigSchema>;

// Environment-specific email configurations
export const developmentEmailDefaults: Partial<EmailConfig> = {
  provider: 'smtp',
  smtp: {
    host: 'localhost',
    port: 1025,
    secure: false,
    auth: {
      user: 'test',
      pass: 'test',
    },
  },
  sender: {
    name: 'NextSaaS Development',
    email: 'dev@nextsaas.local',
  },
  queue: {
    enabled: false,
    provider: 'memory',
  },
  rateLimit: {
    enabled: false,
  },
  tracking: {
    enabled: false,
  },
  development: {
    enabled: true,
    logEmails: true,
    saveToFile: true,
    previewEmails: true,
  },
};

export const productionEmailDefaults: Partial<EmailConfig> = {
  queue: {
    enabled: true,
    provider: 'redis',
    concurrency: 10,
    retries: 5,
  },
  rateLimit: {
    enabled: true,
    maxEmailsPerMinute: 100,
    maxEmailsPerHour: 5000,
    maxEmailsPerDay: 50000,
  },
  tracking: {
    enabled: true,
    openTracking: true,
    clickTracking: true,
    bounceTracking: true,
  },
  security: {
    dkim: {
      enabled: true,
    },
    spf: {
      enabled: true,
    },
    dmarc: {
      enabled: true,
      policy: 'quarantine',
    },
  },
  development: {
    enabled: false,
    logEmails: false,
    saveToFile: false,
    previewEmails: false,
  },
};

export const testEmailDefaults: Partial<EmailConfig> = {
  provider: 'smtp',
  smtp: {
    host: 'localhost',
    port: 1025,
    secure: false,
    auth: {
      user: 'test',
      pass: 'test',
    },
  },
  sender: {
    name: 'NextSaaS Test',
    email: 'test@nextsaas.test',
  },
  queue: {
    enabled: false,
  },
  rateLimit: {
    enabled: false,
  },
  tracking: {
    enabled: false,
  },
  development: {
    enabled: true,
    logEmails: false,
    saveToFile: false,
    previewEmails: false,
  },
};