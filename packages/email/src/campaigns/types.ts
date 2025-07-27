export interface EmailCampaign {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  templateId: string;
  templateVariables: Record<string, any>;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  type: 'one_time' | 'recurring' | 'triggered' | 'ab_test';
  
  // Scheduling
  scheduledAt?: Date;
  timezone?: string;
  recurringPattern?: RecurringPattern;
  
  // Audience
  audienceSegmentIds: string[];
  excludeSegmentIds?: string[];
  audienceCount?: number;
  
  // A/B Testing
  abTestConfig?: ABTestConfig;
  
  // Sending configuration
  sendingConfig: CampaignSendingConfig;
  
  // Tracking
  trackingConfig: CampaignTrackingConfig;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every N days/weeks/months/years
  daysOfWeek?: number[]; // For weekly (0 = Sunday, 6 = Saturday)
  dayOfMonth?: number; // For monthly
  endDate?: Date;
  maxOccurrences?: number;
}

export interface ABTestConfig {
  enabled: boolean;
  variants: ABTestVariant[];
  winnerCriteria: 'open_rate' | 'click_rate' | 'conversion_rate' | 'revenue';
  testDuration: number; // Hours
  trafficSplit: number[]; // Percentage for each variant
  winnerSendTime?: Date;
}

export interface ABTestVariant {
  id: string;
  name: string;
  templateId: string;
  templateVariables: Record<string, any>;
  subjectLine: string;
  fromName?: string;
  percentage: number;
}

export interface CampaignSendingConfig {
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  subjectLine: string;
  preheaderText?: string;
  
  // Rate limiting
  sendRate?: number; // Emails per hour
  batchSize?: number;
  
  // Provider preferences
  preferredProvider?: 'resend' | 'sendgrid';
  fallbackProviders?: string[];
  
  // Delivery options
  trackOpens: boolean;
  trackClicks: boolean;
  requireUnsubscribe: boolean;
}

export interface CampaignTrackingConfig {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  
  // Custom tracking
  customParameters?: Record<string, string>;
  
  // Analytics integration
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  linkedinInsightTag?: string;
}

export interface CampaignMetrics {
  campaignId: string;
  
  // Send metrics
  totalSent: number;
  totalDelivered: number;
  totalBounced: number;
  totalFailed: number;
  
  // Engagement metrics
  totalOpens: number;
  uniqueOpens: number;
  totalClicks: number;
  uniqueClicks: number;
  unsubscribes: number;
  complaints: number;
  
  // Conversion metrics
  conversions?: number;
  revenue?: number;
  
  // Calculated rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  unsubscribeRate: number;
  complaintRate: number;
  conversionRate?: number;
  
  // Time-based metrics
  lastUpdated: Date;
  firstSentAt?: Date;
  lastSentAt?: Date;
}

export interface CampaignAudience {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  
  // Segmentation criteria
  filters: AudienceFilter[];
  
  // Metadata
  contactCount: number;
  lastUpdated: Date;
  createdAt: Date;
}

export interface AudienceFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: any;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

export interface CampaignExecution {
  id: string;
  campaignId: string;
  executionType: 'manual' | 'scheduled' | 'triggered';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Progress tracking
  totalContacts: number;
  processedContacts: number;
  successfulSends: number;
  failedSends: number;
  
  // Execution details
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  
  // A/B test results
  abTestResults?: {
    variants: Array<{
      variantId: string;
      contactCount: number;
      successfulSends: number;
      failedSends: number;
    }>;
  };
  
  // Metadata
  triggeredBy?: string;
  metadata?: Record<string, any>;
}