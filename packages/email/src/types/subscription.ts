export interface EmailSubscription {
  id: string;
  organizationId: string;
  email: string;
  subscriberId?: string;
  status: SubscriptionStatus;
  preferences: SubscriptionPreferences;
  source: SubscriptionSource;
  metadata: SubscriptionMetadata;
  consent: ConsentRecord;
  engagement: EngagementHistory;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  resubscribedAt?: Date;
}

export interface SubscriptionPreferences {
  emailTypes: EmailTypePreference[];
  frequency: FrequencyPreference;
  topics: TopicPreference[];
  format: 'html' | 'text' | 'both';
  language: string;
  timezone: string;
  marketing: boolean;
  transactional: boolean;
  notifications: boolean;
  customPreferences?: Record<string, any>;
}

export interface EmailTypePreference {
  type: string;
  enabled: boolean;
  frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly';
  categories?: string[];
}

export interface FrequencyPreference {
  newsletter: 'daily' | 'weekly' | 'monthly' | 'never';
  promotions: 'daily' | 'weekly' | 'monthly' | 'never';
  updates: 'immediate' | 'daily' | 'weekly' | 'never';
  reminders: 'immediate' | 'daily' | 'weekly' | 'never';
}

export interface TopicPreference {
  topic: string;
  enabled: boolean;
  keywords?: string[];
  segments?: string[];
}

export interface SubscriptionMetadata {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  customFields?: Record<string, any>;
  tags?: string[];
  segments?: string[];
  lists?: string[];
}

export interface ConsentRecord {
  hasConsent: boolean;
  consentType: 'implicit' | 'explicit' | 'opt_in' | 'double_opt_in';
  consentText?: string;
  consentDate: Date;
  consentMethod: 'form' | 'api' | 'import' | 'manual';
  consentSource: string;
  withdrawalDate?: Date;
  withdrawalReason?: string;
  legalBasis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation';
  gdprCompliant: boolean;
  canSpamCompliant: boolean;
}

export interface EngagementHistory {
  totalEmails: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  lastOpened?: Date;
  lastClicked?: Date;
  engagementScore: number;
  recentActivity: Array<{
    date: Date;
    event: 'opened' | 'clicked' | 'bounced' | 'complained';
    campaignId?: string;
    emailId?: string;
  }>;
  segments: Array<{
    segment: string;
    score: number;
    lastActivity: Date;
  }>;
}

export interface SubscriberProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  address?: Address;
  demographics?: Demographics;
  preferences: SubscriptionPreferences;
  subscription: EmailSubscription;
  customFields?: Record<string, any>;
  tags?: string[];
  segments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Demographics {
  age?: number;
  ageRange?: string;
  gender?: string;
  occupation?: string;
  industry?: string;
  company?: string;
  jobTitle?: string;
  income?: string;
  education?: string;
}

export interface UnsubscribeRecord {
  id: string;
  organizationId: string;
  email: string;
  unsubscribeType: 'global' | 'list' | 'category';
  reason?: UnsubscribeReason;
  customReason?: string;
  method: 'link' | 'reply' | 'complaint' | 'bounce' | 'manual' | 'api';
  source: string;
  campaignId?: string;
  emailId?: string;
  ipAddress?: string;
  userAgent?: string;
  canResubscribe: boolean;
  isTemporary: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface ResubscribeRecord {
  id: string;
  organizationId: string;
  email: string;
  method: 'form' | 'api' | 'manual';
  source: string;
  consent: ConsentRecord;
  previousUnsubscribe?: string; // unsubscribe record ID
  createdAt: Date;
}

export interface SuppressionList {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'global' | 'campaign' | 'temporary' | 'compliance';
  emails: SuppressionEntry[];
  autoUpdate: boolean;
  rules?: SuppressionRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SuppressionEntry {
  email: string;
  reason: SuppressionReason;
  addedAt: Date;
  addedBy: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface SuppressionRule {
  id: string;
  condition: {
    field: string;
    operator: string;
    value: any;
  };
  action: 'suppress' | 'unsuppress';
  duration?: number; // days
  enabled: boolean;
}

export interface SubscriptionCenter {
  organizationId: string;
  config: SubscriptionCenterConfig;
  branding: SubscriptionCenterBranding;
  customization: SubscriptionCenterCustomization;
}

export interface SubscriptionCenterConfig {
  allowUnsubscribeAll: boolean;
  allowFrequencyControl: boolean;
  allowTopicSelection: boolean;
  allowFormatSelection: boolean;
  requireReasonForUnsubscribe: boolean;
  showEngagementHistory: boolean;
  enableResubscribe: boolean;
  customFields: Array<{
    name: string;
    type: string;
    required: boolean;
    options?: string[];
  }>;
}

export interface SubscriptionCenterBranding {
  logo?: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  customCss?: string;
}

export interface SubscriptionCenterCustomization {
  title: string;
  description: string;
  successMessage: string;
  unsubscribeMessage: string;
  resubscribeMessage: string;
  footerText?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  translations?: Record<string, {
    title: string;
    description: string;
    successMessage: string;
    unsubscribeMessage: string;
    resubscribeMessage: string;
  }>;
}

export interface SubscriptionAnalytics {
  organizationId: string;
  period: {
    start: Date;
    end: Date;
  };
  totals: {
    subscribers: number;
    unsubscribes: number;
    resubscribes: number;
    bounces: number;
    complaints: number;
  };
  growth: {
    newSubscribers: number;
    growthRate: number;
    churnRate: number;
    netGrowth: number;
  };
  engagement: {
    activeSubscribers: number;
    engagementRate: number;
    topSegments: Array<{
      segment: string;
      size: number;
      engagementRate: number;
    }>;
  };
  demographics: {
    byCountry: Record<string, number>;
    byDevice: Record<string, number>;
    bySource: Record<string, number>;
  };
  unsubscribeReasons: Record<string, number>;
}

export interface DoubleOptInConfig {
  enabled: boolean;
  templateId: string;
  confirmationPageUrl?: string;
  expirationTime: number; // hours
  autoRemoveUnconfirmed: boolean;
  reminderEmails: {
    enabled: boolean;
    delays: number[]; // hours after initial email
    templateId: string;
  };
}

export interface SubscriptionImport {
  id: string;
  organizationId: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  errorRows: number;
  errors?: Array<{
    row: number;
    email?: string;
    error: string;
  }>;
  mapping: Record<string, string>;
  settings: {
    hasHeaders: boolean;
    delimiter: string;
    requireDoubleOptIn: boolean;
    updateExisting: boolean;
    suppressionList?: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

export type SubscriptionStatus = 
  | 'pending'
  | 'active'
  | 'unsubscribed'
  | 'bounced'
  | 'complained'
  | 'suppressed'
  | 'expired';

export type SubscriptionSource = 
  | 'signup'
  | 'import'
  | 'api'
  | 'manual'
  | 'form'
  | 'checkout'
  | 'referral'
  | 'social'
  | 'partner';

export type UnsubscribeReason = 
  | 'too_frequent'
  | 'not_relevant'
  | 'never_subscribed'
  | 'privacy_concerns'
  | 'technical_issues'
  | 'found_better_alternative'
  | 'temporary_absence'
  | 'other';

export type SuppressionReason = 
  | 'unsubscribed'
  | 'bounced'
  | 'complained'
  | 'invalid'
  | 'role_account'
  | 'disposable'
  | 'compliance'
  | 'manual';