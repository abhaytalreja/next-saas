import { z } from 'zod';

/**
 * Integrations Configuration Schema
 * 
 * Validates third-party service integrations including:
 * - Analytics services (Google Analytics, Mixpanel, etc.)
 * - Customer support (Intercom, Zendesk, etc.)
 * - Marketing tools (Mailchimp, ConvertKit, etc.)
 * - Communication services (Slack, Discord, etc.)
 * - Social media platforms
 * - Development tools and APIs
 */

// Analytics integrations
const analyticsIntegrationsSchema = z.object({
  googleAnalytics: z.object({
    enabled: z.boolean().default(false),
    measurementId: z.string().optional(),
    trackingId: z.string().optional(), // Legacy UA tracking ID
    gtag: z.object({
      enabled: z.boolean().default(true),
      config: z.record(z.string(), z.any()).default({}),
    }).default({}),
    enhancedEcommerce: z.boolean().default(false),
    anonymizeIp: z.boolean().default(true),
    cookieConsent: z.boolean().default(true),
  }).default({}),
  
  googleTagManager: z.object({
    enabled: z.boolean().default(false),
    containerId: z.string().optional(),
    auth: z.string().optional(),
    preview: z.string().optional(),
  }).default({}),
  
  mixpanel: z.object({
    enabled: z.boolean().default(false),
    projectToken: z.string().optional(),
    trackPageViews: z.boolean().default(true),
    trackClicks: z.boolean().default(false),
    persistence: z.enum(['localStorage', 'cookie']).default('localStorage'),
  }).default({}),
  
  amplitude: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().optional(),
    trackSessions: z.boolean().default(true),
    trackRevenue: z.boolean().default(true),
  }).default({}),
  
  hotjar: z.object({
    enabled: z.boolean().default(false),
    hjid: z.number().int().optional(),
    hjsv: z.number().int().default(6),
  }).default({}),
  
  fullstory: z.object({
    enabled: z.boolean().default(false),
    orgId: z.string().optional(),
    debug: z.boolean().default(false),
  }).default({}),
  
  posthog: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().optional(),
    apiHost: z.string().default('https://app.posthog.com'),
    capturePageViews: z.boolean().default(true),
  }).default({}),
}).describe('Analytics services integration configuration');

// Customer support integrations
const supportIntegrationsSchema = z.object({
  intercom: z.object({
    enabled: z.boolean().default(false),
    appId: z.string().optional(),
    apiKey: z.string().optional(),
    hideDefaultLauncher: z.boolean().default(false),
    alignment: z.enum(['left', 'right']).default('right'),
    verticalPadding: z.number().int().default(20),
    customLauncherSelector: z.string().optional(),
  }).default({}),
  
  zendesk: z.object({
    enabled: z.boolean().default(false),
    subdomain: z.string().optional(),
    keyId: z.string().optional(),
    widget: z.object({
      enabled: z.boolean().default(true),
      position: z.enum(['left', 'right']).default('right'),
      color: z.string().default('#1f73b7'),
    }).default({}),
  }).default({}),
  
  freshdesk: z.object({
    enabled: z.boolean().default(false),
    domain: z.string().optional(),
    widgetId: z.string().optional(),
    locale: z.string().default('en'),
  }).default({}),
  
  crisp: z.object({
    enabled: z.boolean().default(false),
    websiteId: z.string().optional(),
    tokenId: z.string().optional(),
    autoLoad: z.boolean().default(true),
  }).default({}),
  
  helpScout: z.object({
    enabled: z.boolean().default(false),
    beaconId: z.string().optional(),
    signature: z.string().optional(),
    showContactFields: z.boolean().default(true),
  }).default({}),
}).describe('Customer support services integration configuration');

// Marketing integrations
const marketingIntegrationsSchema = z.object({
  mailchimp: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().optional(),
    serverPrefix: z.string().optional(),
    defaultListId: z.string().optional(),
    doubleOptIn: z.boolean().default(true),
  }).default({}),
  
  convertkit: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    defaultFormId: z.string().optional(),
  }).default({}),
  
  klaviyo: z.object({
    enabled: z.boolean().default(false),
    publicApiKey: z.string().optional(),
    privateApiKey: z.string().optional(),
    trackPageViews: z.boolean().default(true),
  }).default({}),
  
  hubspot: z.object({
    enabled: z.boolean().default(false),
    portalId: z.string().optional(),
    accessToken: z.string().optional(),
    trackPageViews: z.boolean().default(true),
    formId: z.string().optional(),
  }).default({}),
  
  salesforce: z.object({
    enabled: z.boolean().default(false),
    username: z.string().optional(),
    password: z.string().optional(),
    securityToken: z.string().optional(),
    loginUrl: z.string().default('https://login.salesforce.com'),
  }).default({}),
}).describe('Marketing services integration configuration');

// Communication integrations
const communicationIntegrationsSchema = z.object({
  slack: z.object({
    enabled: z.boolean().default(false),
    webhookUrl: z.string().url().optional(),
    botToken: z.string().optional(),
    channels: z.object({
      general: z.string().optional(),
      alerts: z.string().optional(),
      sales: z.string().optional(),
      support: z.string().optional(),
    }).default({}),
    notifications: z.object({
      newSignups: z.boolean().default(true),
      newPayments: z.boolean().default(true),
      errors: z.boolean().default(true),
      downtimes: z.boolean().default(true),
    }).default({}),
  }).default({}),
  
  discord: z.object({
    enabled: z.boolean().default(false),
    webhookUrl: z.string().url().optional(),
    botToken: z.string().optional(),
    guildId: z.string().optional(),
    channels: z.object({
      general: z.string().optional(),
      alerts: z.string().optional(),
      logs: z.string().optional(),
    }).default({}),
  }).default({}),
  
  teams: z.object({
    enabled: z.boolean().default(false),
    webhookUrl: z.string().url().optional(),
    themeColor: z.string().default('#0078d4'),
  }).default({}),
  
  telegram: z.object({
    enabled: z.boolean().default(false),
    botToken: z.string().optional(),
    chatId: z.string().optional(),
    parseMode: z.enum(['HTML', 'Markdown']).default('HTML'),
  }).default({}),
}).describe('Communication services integration configuration');

// Social media integrations
const socialMediaIntegrationsSchema = z.object({
  twitter: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
    accessTokenSecret: z.string().optional(),
    bearerToken: z.string().optional(),
  }).default({}),
  
  facebook: z.object({
    enabled: z.boolean().default(false),
    appId: z.string().optional(),
    appSecret: z.string().optional(),
    pageAccessToken: z.string().optional(),
    pixelId: z.string().optional(),
  }).default({}),
  
  linkedin: z.object({
    enabled: z.boolean().default(false),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    companyId: z.string().optional(),
  }).default({}),
  
  instagram: z.object({
    enabled: z.boolean().default(false),
    accessToken: z.string().optional(),
    businessAccountId: z.string().optional(),
  }).default({}),
}).describe('Social media integration configuration');

// Development and monitoring integrations
const devIntegrationsSchema = z.object({
  sentry: z.object({
    enabled: z.boolean().default(false),
    dsn: z.string().url().optional(),
    environment: z.string().optional(),
    release: z.string().optional(),
    sampleRate: z.number().min(0).max(1).default(1.0),
    tracesSampleRate: z.number().min(0).max(1).default(0.1),
  }).default({}),
  
  logRocket: z.object({
    enabled: z.boolean().default(false),
    appId: z.string().optional(),
    release: z.string().optional(),
    shouldCaptureXHR: z.boolean().default(true),
  }).default({}),
  
  datadog: z.object({
    enabled: z.boolean().default(false),
    clientToken: z.string().optional(),
    applicationId: z.string().optional(),
    site: z.string().default('datadoghq.com'),
    service: z.string().optional(),
    env: z.string().optional(),
    version: z.string().optional(),
  }).default({}),
  
  newRelic: z.object({
    enabled: z.boolean().default(false),
    licenseKey: z.string().optional(),
    applicationId: z.string().optional(),
    browserAgent: z.boolean().default(true),
  }).default({}),
  
  vercel: z.object({
    enabled: z.boolean().default(false),
    projectId: z.string().optional(),
    teamId: z.string().optional(),
    token: z.string().optional(),
  }).default({}),
  
  github: z.object({
    enabled: z.boolean().default(false),
    token: z.string().optional(),
    owner: z.string().optional(),
    repo: z.string().optional(),
  }).default({}),
}).describe('Development and monitoring integrations');

// SEO and marketing tools
const seoIntegrationsSchema = z.object({
  googleSearchConsole: z.object({
    enabled: z.boolean().default(false),
    siteUrl: z.string().url().optional(),
    serviceAccountKeyFile: z.string().optional(),
  }).default({}),
  
  bing: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().optional(),
    siteUrl: z.string().url().optional(),
  }).default({}),
  
  semrush: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().optional(),
    database: z.string().default('us'),
  }).default({}),
  
  ahrefs: z.object({
    enabled: z.boolean().default(false),
    apiToken: z.string().optional(),
  }).default({}),
}).describe('SEO and marketing tools integration');

// Main integrations configuration schema
export const integrationsConfigSchema = z.object({
  // Analytics services
  analytics: analyticsIntegrationsSchema.default({}),
  
  // Customer support
  support: supportIntegrationsSchema.default({}),
  
  // Marketing tools
  marketing: marketingIntegrationsSchema.default({}),
  
  // Communication services
  communication: communicationIntegrationsSchema.default({}),
  
  // Social media
  socialMedia: socialMediaIntegrationsSchema.default({}),
  
  // Development and monitoring
  development: devIntegrationsSchema.default({}),
  
  // SEO and marketing tools
  seo: seoIntegrationsSchema.default({}),
  
  // Global integration settings
  global: z.object({
    enabledInDevelopment: z.boolean().default(false),
    enabledInStaging: z.boolean().default(true),
    enabledInProduction: z.boolean().default(true),
    
    // Rate limiting for API calls
    rateLimit: z.object({
      enabled: z.boolean().default(true),
      requestsPerMinute: z.number().int().min(1).default(60),
      requestsPerHour: z.number().int().min(1).default(1000),
    }).default({}),
    
    // Retry configuration
    retries: z.object({
      maxAttempts: z.number().int().min(1).default(3),
      backoffMultiplier: z.number().min(1).default(2),
      initialDelay: z.number().int().min(100).default(1000),
    }).default({}),
    
    // Timeout configuration
    timeout: z.object({
      default: z.number().int().min(1000).default(10000),
      analytics: z.number().int().min(1000).default(5000),
      support: z.number().int().min(1000).default(15000),
      marketing: z.number().int().min(1000).default(30000),
    }).default({}),
  }).default({}),
  
}).describe('Third-party services integration configuration');

// Export types
export type IntegrationsConfig = z.infer<typeof integrationsConfigSchema>;
export type AnalyticsIntegrations = z.infer<typeof analyticsIntegrationsSchema>;
export type SupportIntegrations = z.infer<typeof supportIntegrationsSchema>;

// Environment-specific integration configurations
export const developmentIntegrationsDefaults: Partial<IntegrationsConfig> = {
  global: {
    enabledInDevelopment: true,
    enabledInStaging: true,
    enabledInProduction: false,
  },
  analytics: {
    googleAnalytics: {
      enabled: false,
    },
    mixpanel: {
      enabled: false,
    },
  },
  development: {
    sentry: {
      enabled: true,
      environment: 'development',
      sampleRate: 1.0,
      tracesSampleRate: 1.0,
    },
  },
  communication: {
    slack: {
      enabled: false,
      notifications: {
        newSignups: false,
        newPayments: false,
        errors: true,
        downtimes: true,
      },
    },
  },
};

export const productionIntegrationsDefaults: Partial<IntegrationsConfig> = {
  global: {
    enabledInDevelopment: false,
    enabledInStaging: true,
    enabledInProduction: true,
    rateLimit: {
      enabled: true,
      requestsPerMinute: 100,
      requestsPerHour: 5000,
    },
  },
  analytics: {
    googleAnalytics: {
      enabled: true,
      enhancedEcommerce: true,
      anonymizeIp: true,
      cookieConsent: true,
    },
  },
  development: {
    sentry: {
      enabled: true,
      environment: 'production',
      sampleRate: 0.1,
      tracesSampleRate: 0.01,
    },
    datadog: {
      enabled: true,
      env: 'production',
    },
  },
  communication: {
    slack: {
      enabled: true,
      notifications: {
        newSignups: true,
        newPayments: true,
        errors: true,
        downtimes: true,
      },
    },
  },
  support: {
    intercom: {
      enabled: true,
      hideDefaultLauncher: false,
      alignment: 'right',
    },
  },
};

export const testIntegrationsDefaults: Partial<IntegrationsConfig> = {
  global: {
    enabledInDevelopment: false,
    enabledInStaging: false,
    enabledInProduction: false,
  },
  analytics: {
    googleAnalytics: {
      enabled: false,
    },
  },
  development: {
    sentry: {
      enabled: false,
    },
  },
  communication: {
    slack: {
      enabled: false,
    },
  },
  support: {
    intercom: {
      enabled: false,
    },
  },
};