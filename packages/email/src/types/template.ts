import { ReactNode } from 'react';

export interface TemplateProps {
  organizationId: string;
  branding: OrganizationBranding;
  content: TemplateContent;
  recipient: TemplateRecipient;
  unsubscribeUrl?: string;
  previewText?: string;
  metadata?: Record<string, any>;
}

export interface OrganizationBranding {
  name: string;
  logo?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  fontFamily?: string;
  website?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface TemplateContent {
  subject: string;
  preview?: string;
  heading?: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  footer?: string;
  disclaimer?: string;
  [key: string]: any;
}

export interface TemplateRecipient {
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  preferences?: {
    language: string;
    timezone: string;
    frequency?: string;
  };
  customFields?: Record<string, any>;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'url' | 'email' | 'object';
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface TemplateMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: TemplateCategory;
  industry?: string;
  tags: string[];
  variables: TemplateVariable[];
  previewData: Record<string, any>;
  version: string;
  compatibility: {
    emailClients: string[];
    devices: string[];
  };
  accessibility: {
    altText: boolean;
    colorContrast: boolean;
    semanticMarkup: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: string;
  name: string;
  html: string;
  text: string;
  subject: string;
  variables: TemplateVariable[];
  isActive: boolean;
  changelog?: string;
  createdAt: Date;
  createdBy: string;
}

export interface TemplateTestData {
  organizationId: string;
  branding: Partial<OrganizationBranding>;
  content: Partial<TemplateContent>;
  recipient: Partial<TemplateRecipient>;
  customVariables?: Record<string, any>;
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
  accessibility: {
    score: number;
    issues: Array<{
      type: string;
      message: string;
      element?: string;
    }>;
  };
  compatibility: {
    emailClients: Array<{
      client: string;
      supported: boolean;
      issues?: string[];
    }>;
  };
}

export interface TemplatePreview {
  html: string;
  text: string;
  subject: string;
  previewText: string;
  screenshots?: {
    desktop: string;
    mobile: string;
    darkMode?: string;
  };
  compatibility: {
    emailClient: string;
    supported: boolean;
    renderingIssues?: string[];
  }[];
}

export interface TemplatePersonalization {
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'gt' | 'lt';
    value: any;
  }>;
  content: {
    subject?: string;
    message?: string;
    ctaText?: string;
    ctaUrl?: string;
    image?: string;
    [key: string]: any;
  };
}

export interface IndustryTemplate {
  industry: string;
  variants: TemplateVariant[];
  customFields: TemplateVariable[];
  brandingOverrides: Partial<OrganizationBranding>;
  contentGuidelines: {
    tone: string;
    messaging: string[];
    compliance: string[];
  };
}

export interface TemplateVariant {
  id: string;
  name: string;
  description: string;
  content: Partial<TemplateContent>;
  styling: Record<string, any>;
  targeting?: {
    audience: string[];
    segments: string[];
  };
}

export type TemplateCategory = 
  | 'welcome'
  | 'verification'
  | 'password-reset'
  | 'invitation'
  | 'billing'
  | 'notification'
  | 'newsletter'
  | 'announcement'
  | 'promotion'
  | 'reminder'
  | 'survey'
  | 'event'
  | 'onboarding'
  | 'retention'
  | 'win-back'
  | 'custom';

export type TemplateStatus = 'draft' | 'active' | 'archived' | 'deprecated';

export type TemplateEngine = 'react-email' | 'handlebars' | 'mjml' | 'html';

export interface TemplateComponent {
  component: React.ComponentType<TemplateProps>;
  metadata: TemplateMetadata;
  preview?: React.ComponentType<{ data: TemplateTestData }>;
}