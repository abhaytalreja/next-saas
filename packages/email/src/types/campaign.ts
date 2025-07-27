export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  templateId: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  audience: CampaignAudience;
  content: CampaignContent;
  schedule: CampaignSchedule;
  settings: CampaignSettings;
  analytics: CampaignAnalytics;
  tags?: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  sentAt?: Date;
  completedAt?: Date;
}

export interface CampaignContent {
  templateId: string;
  templateVersion?: string;
  variables: Record<string, any>;
  personalization?: Array<{
    segment: string;
    variables: Record<string, any>;
  }>;
  abTest?: {
    enabled: boolean;
    variants: Array<{
      id: string;
      name: string;
      subject?: string;
      content?: Record<string, any>;
      percentage: number;
    }>;
    winnerCriteria: 'open_rate' | 'click_rate' | 'conversion_rate';
    testDuration: number; // hours
  };
}

export interface CampaignAudience {
  type: 'all' | 'segment' | 'list' | 'custom';
  filters?: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'gt' | 'lt' | 'in' | 'not_in';
    value: any;
  }>;
  segments?: string[];
  lists?: string[];
  customQuery?: string;
  estimatedSize?: number;
  actualSize?: number;
  exclusions?: {
    unsubscribed: boolean;
    bounced: boolean;
    complained: boolean;
    domains?: string[];
    emails?: string[];
  };
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'recurring' | 'triggered';
  scheduledAt?: Date;
  timezone?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    endAfterOccurrences?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    monthOfYear?: number;
  };
  triggered?: {
    event: string;
    delay?: number; // minutes
    conditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  sendOptimization?: {
    enabled: boolean;
    timezoneOptimization: boolean;
    engagementOptimization: boolean;
  };
}

export interface CampaignSettings {
  trackOpens: boolean;
  trackClicks: boolean;
  trackUnsubscribes: boolean;
  allowUnsubscribe: boolean;
  suppressionList?: string[];
  deliverySettings: {
    provider?: string;
    priority: 'low' | 'normal' | 'high';
    rateLimiting?: {
      emailsPerHour: number;
      emailsPerDay: number;
    };
  };
  compliance: {
    gdprCompliant: boolean;
    canSpamCompliant: boolean;
    requireDoubleOptIn: boolean;
    includeUnsubscribeLink: boolean;
    includePhysicalAddress: boolean;
  };
}

export interface CampaignAnalytics {
  sent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  complained: number;
  converted: number;
  revenue?: number;
  rates: {
    delivery: number;
    open: number;
    click: number;
    unsubscribe: number;
    complaint: number;
    conversion: number;
  };
  engagement: {
    avgTimeToOpen?: number; // minutes
    avgTimeToClick?: number; // minutes
    topLinks?: Array<{
      url: string;
      clicks: number;
    }>;
    deviceBreakdown?: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
    clientBreakdown?: Record<string, number>;
  };
  geography?: Record<string, number>;
  timeline?: Array<{
    timestamp: Date;
    event: string;
    count: number;
  }>;
}

export interface CampaignDraft {
  id?: string;
  organizationId: string;
  name: string;
  type: CampaignType;
  templateId?: string;
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  audience?: Partial<CampaignAudience>;
  content?: Partial<CampaignContent>;
  schedule?: Partial<CampaignSchedule>;
  settings?: Partial<CampaignSettings>;
  lastModified: Date;
  autoSave: boolean;
}

export interface CampaignTest {
  campaignId: string;
  testEmails: string[];
  type: 'preview' | 'spam_check' | 'link_check' | 'deliverability';
  results?: {
    spamScore?: number;
    spamReasons?: string[];
    brokenLinks?: string[];
    deliverabilityScore?: number;
    issues?: string[];
  };
  sentAt: Date;
  completedAt?: Date;
}

export interface CampaignApproval {
  campaignId: string;
  requestedBy: string;
  requestedAt: Date;
  approvers: string[];
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  comments?: Array<{
    author: string;
    message: string;
    timestamp: Date;
  }>;
}

export interface CampaignSequence {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  trigger: {
    event: string;
    conditions?: Record<string, any>;
  };
  emails: Array<{
    id: string;
    campaignId: string;
    delay: number; // minutes from previous email or trigger
    conditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  }>;
  status: 'active' | 'paused' | 'stopped';
  analytics: {
    enrolled: number;
    completed: number;
    dropped: number;
    conversionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignType = 
  | 'newsletter'
  | 'announcement' 
  | 'promotion'
  | 'onboarding'
  | 'retention'
  | 'survey'
  | 'event'
  | 'product_update'
  | 'educational'
  | 'transactional'
  | 'drip'
  | 'win_back'
  | 'custom';

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'paused'
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'pending_approval';

export type CampaignPriority = 'low' | 'normal' | 'high' | 'urgent';