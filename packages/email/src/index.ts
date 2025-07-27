// Main exports
export { EmailService } from './services/email-service';
export type { EmailServiceConfig } from './services/email-service';

// Provider exports
export * from './providers';

// Template exports
export * from './templates';

// Campaign Management
export { CampaignManager } from './campaigns/CampaignManager';
export { AudienceService } from './campaigns/AudienceService';
export type {
  EmailCampaign,
  CampaignExecution,
  CampaignMetrics,
  CampaignAudience,
  AudienceFilter,
  RecurringPattern,
  ABTestConfig,
  ABTestVariant,
  CampaignSendingConfig,
  CampaignTrackingConfig
} from './campaigns/types';

// Analytics
export { EmailAnalytics } from './analytics/EmailAnalytics';

// Compliance & Subscription Management
export { SubscriptionManager } from './compliance/SubscriptionManager';

// Webhook Management
export { WebhookManager } from './webhooks/WebhookManager';
export type {
  WebhookEvent,
  WebhookHandlerConfig,
  WebhookProcessor
} from './webhooks/WebhookManager';

// Email Testing & Preview
export { EmailTester } from './testing/EmailTester';
export type {
  EmailTest,
  EmailTestResults,
  EmailPreviewOptions
} from './testing/EmailTester';

// Types
export * from './types';