// Base provider exports
export * from './base';

// Provider implementations
export { ResendProvider } from './resend/resend-client';
export { ResendEmailSender } from './resend/resend-sender';
export { ResendAnalytics } from './resend/resend-analytics';
export { ResendWebhookHandler } from './resend/resend-webhooks';

export { SendGridProvider } from './sendgrid/sendgrid-client';

// Provider types
export type {
  EmailProvider,
  EmailProviderConfig,
  EmailProviderFeatures,
  ProviderName,
  ProviderRoutingRule,
  ProviderFailoverConfig,
} from '../types';