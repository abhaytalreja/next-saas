/**
 * Use Case Configuration Types for NextSaaS
 * 
 * This file defines the comprehensive type system for customizing
 * the entire NextSaaS application for specific industries and use cases.
 */

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

export interface FeatureSection {
  title: string;
  description: string;
  icon: string;
  benefits: string[];
  image?: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  popular?: boolean;
  ctaText?: string;
}

export interface Testimonial {
  name: string;
  title: string;
  company: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface SocialLink {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'github';
  url: string;
}

export interface FooterSection {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

export interface DashboardWidget {
  id: string;
  name: string;
  type: 'metric' | 'chart' | 'table' | 'activity-feed' | 'custom';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: Record<string, unknown>;
}

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: string;
  children?: DashboardNavItem[];
}

export interface QuickAction {
  label: string;
  action: string;
  icon: string;
  description?: string;
}

export interface EntityDefinition {
  name: string;
  fields: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'phone' | 'enum' | 'json';
    required?: boolean;
    options?: string[]; // For enum types
    validation?: Record<string, unknown>;
  }>;
  relationships?: string[];
}

export interface RelationshipDefinition {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  foreignKey?: string;
}

export interface CustomFieldDefinition {
  entity: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
}

export interface CustomFeature {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
}

export interface EmailTemplate {
  subject: string;
  content: string;
  variables: string[];
}

export interface UseCaseConfig {
  // Basic Information
  industry: string;
  useCase: string;
  displayName: string;
  description: string;
  
  // Branding & Design
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo?: string;
    favicon?: string;
    fontPrimary?: string;
    fontSecondary?: string;
  };
  
  // Content Customization
  content: {
    // Hero Section
    hero: {
      headline: string;
      subheadline: string;
      ctaText: string;
      backgroundImage?: string;
      features: string[];
    };
    
    // Navigation
    navigation: {
      brandName: string;
      menuItems: NavigationItem[];
    };
    
    // Features Section
    features: FeatureSection[];
    
    // Pricing
    pricing: {
      title: string;
      subtitle: string;
      plans: PricingPlan[];
    };
    
    // Testimonials
    testimonials: Testimonial[];
    
    // FAQ
    faq: FAQItem[];
    
    // Footer
    footer: {
      companyDescription: string;
      links: FooterSection[];
      socialLinks: SocialLink[];
    };
  };
  
  // Dashboard Customization
  dashboard: {
    defaultLayout: 'crm' | 'analytics' | 'project' | 'ecommerce' | 'custom';
    widgets: DashboardWidget[];
    navigation: DashboardNavItem[];
    quickActions: QuickAction[];
  };
  
  // Database Schema Customization
  dataModel: {
    entities: EntityDefinition[];
    relationships?: RelationshipDefinition[];
    customFields?: CustomFieldDefinition[];
  };
  
  // Feature Flags
  features: {
    enabledFeatures: string[];
    disabledFeatures: string[];
    customFeatures?: CustomFeature[];
  };
  
  // Integration Preferences
  integrations?: {
    recommended: string[];
    required: string[];
    optional: string[];
  };
  
  // Email Templates
  emailTemplates?: {
    welcome: EmailTemplate;
    notification: EmailTemplate;
    marketing?: EmailTemplate[];
  };
  
  // Legal & Compliance
  legal?: {
    privacyPolicy: string;
    termsOfService: string;
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    industryCompliance: string[];
  };
}

// Predefined industry types
export type Industry = 
  | 'real-estate'
  | 'cryptocurrency'
  | 'healthcare'
  | 'fintech'
  | 'e-commerce'
  | 'education'
  | 'marketing'
  | 'project-management'
  | 'crm'
  | 'custom';

// Predefined use case types
export type UseCase = 
  | 'property-management'
  | 'defi-platform'
  | 'patient-management'
  | 'trading-platform'
  | 'online-store'
  | 'learning-management'
  | 'campaign-management'
  | 'task-management'
  | 'sales-crm'
  | 'custom';

// Helper type for partial configurations during setup
export type PartialUseCaseConfig = Partial<UseCaseConfig> & {
  industry: Industry;
  useCase: UseCase;
  displayName: string;
};