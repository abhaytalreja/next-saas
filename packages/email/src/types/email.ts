export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
  contentId?: string;
}

export interface EmailData {
  to: EmailAddress | EmailAddress[] | string | string[];
  from: EmailAddress | string;
  replyTo?: EmailAddress | string;
  cc?: EmailAddress | EmailAddress[] | string | string[];
  bcc?: EmailAddress | EmailAddress[] | string | string[];
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
  organizationId: string;
  templateId?: string;
  campaignId?: string;
  trackingId?: string;
  unsubscribeUrl?: string;
  listUnsubscribeHeader?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface EmailTemplateData {
  organizationId: string;
  recipient: {
    email: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
  organization: {
    name: string;
    logo?: string;
    primaryColor?: string;
    address?: string;
    website?: string;
  };
  content: Record<string, any>;
  unsubscribeUrl?: string;
  preferences?: {
    language: string;
    timezone: string;
  };
}

export interface EmailQueueItem {
  id: string;
  organizationId: string;
  emailData: EmailData;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: Date;
  maxRetries: number;
  currentRetries: number;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  providerId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
}

export interface EmailDeliveryStatus {
  messageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'rejected' | 'failed';
  timestamp: Date;
  provider: string;
  details?: Record<string, any>;
  recipient: string;
  reason?: string;
}

export interface EmailEngagementEvent {
  messageId: string;
  type: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  timestamp: Date;
  provider: string;
  recipient: string;
  details?: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    link?: string;
    bounceType?: string;
    bounceReason?: string;
  };
  campaignId?: string;
  organizationId: string;
}

export interface EmailValidationResult {
  isValid: boolean;
  email: string;
  reason?: string;
  suggestions?: string[];
  deliverable?: boolean;
  roleAccount?: boolean;
  freeProvider?: boolean;
  disposable?: boolean;
}

export interface BulkEmailResult {
  totalEmails: number;
  successful: number;
  failed: number;
  results: EmailResult[];
  errors?: Array<{
    email: string;
    error: string;
  }>;
}

export type EmailType = 'transactional' | 'marketing' | 'system' | 'notification';

export type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';

export type EmailStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'queued' 
  | 'sending' 
  | 'sent' 
  | 'delivered' 
  | 'bounced' 
  | 'failed' 
  | 'cancelled';