import { EmailData, EmailResult, EmailTemplateData, BulkEmailResult } from './email';

export interface EmailProviderConfig {
  apiKey: string;
  apiSecret?: string;
  region?: string;
  endpoint?: string;
  webhookSecret?: string;
  fromDomain?: string;
  replyToDomain?: string;
  trackingDomain?: string;
  rateLimits?: {
    perSecond?: number;
    perMinute?: number;
    perHour?: number;
    perDay?: number;
  };
  features?: EmailProviderFeatures;
  settings?: Record<string, any>;
}

export interface EmailProviderFeatures {
  transactional: boolean;
  marketing: boolean;
  templates: boolean;
  scheduling: boolean;
  tracking: boolean;
  analytics: boolean;
  webhooks: boolean;
  attachments: boolean;
  inlineImages: boolean;
  bulkSending: boolean;
  listManagement: boolean;
  automation: boolean;
  abTesting: boolean;
  customDomains: boolean;
  ipWarmup: boolean;
  reputation: boolean;
}

export interface EmailProviderStatus {
  healthy: boolean;
  lastChecked: Date;
  responseTime: number;
  errorRate: number;
  withinLimits: boolean;
  rateLimitReset?: Date;
  downtime?: {
    start: Date;
    end?: Date;
    reason?: string;
  };
  issues?: string[];
}

export interface EmailProviderStats {
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  costs: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface EmailProvider {
  name: string;
  displayName: string;
  type: 'transactional' | 'marketing' | 'hybrid';
  priority: number;
  maxDaily: number;
  costPerEmail: number;
  reliability: number;
  features: EmailProviderFeatures;
  config: EmailProviderConfig;
  
  // Core methods
  sendEmail(emailData: EmailData): Promise<EmailResult>;
  sendBulkEmails(emails: EmailData[]): Promise<BulkEmailResult>;
  
  // Template methods
  createTemplate?(template: EmailTemplate): Promise<string>;
  updateTemplate?(templateId: string, template: EmailTemplate): Promise<void>;
  deleteTemplate?(templateId: string): Promise<void>;
  getTemplate?(templateId: string): Promise<EmailTemplate>;
  
  // Health and status
  checkHealth(): Promise<EmailProviderStatus>;
  getStats(period: { start: Date; end: Date }): Promise<EmailProviderStats>;
  
  // Webhooks
  validateWebhook?(payload: any, signature: string): boolean;
  processWebhook?(payload: any): Promise<void>;
}

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  description?: string;
  html: string;
  text?: string;
  designData?: Record<string, any>;
  variables?: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
    description?: string;
  }>;
  categories?: string[];
  tags?: string[];
  organizationId?: string;
  isActive: boolean;
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProviderRoutingRule {
  id: string;
  organizationId?: string;
  priority: number;
  conditions: {
    emailType?: 'transactional' | 'marketing';
    volume?: { min?: number; max?: number };
    recipient?: { domains?: string[]; exclude?: string[] };
    time?: { start: string; end: string; timezone: string };
    tags?: string[];
  };
  provider: string;
  fallbackProvider?: string;
  enabled: boolean;
}

export interface ProviderFailoverConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number; // milliseconds
  fallbackProviders: string[];
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeout: number; // milliseconds
  };
}

export interface EmailProviderMetrics {
  provider: string;
  timestamp: Date;
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
  responseTime: number;
  errorRate: number;
  cost: number;
  throughput: number; // emails per minute
  reputation?: number;
}

export type ProviderName = 'resend' | 'sendgrid' | 'ses' | 'postmark' | 'mailgun';

export interface ProviderHealthCheck {
  provider: ProviderName;
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
  responseTime: number;
  errorRate: number;
  details?: Record<string, any>;
}