export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  settings: OrganizationSettings;
  branding?: BrandingConfig;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'past_due';
  subscription_id?: string;
  plan_id?: string;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface OrganizationSettings {
  allowMemberInvites: boolean;
  requireEmailVerification: boolean;
  requireTwoFactor: boolean;
  sessionTimeout: number; // minutes
  ipWhitelist: string[];
  ssoEnabled: boolean;
  ssoProvider?: 'okta' | 'auth0' | 'azure' | 'google';
  ssoConfig?: Record<string, any>;
  brandingEnabled: boolean;
  customDomain?: string;
  dataRetentionDays: number;
  auditLogRetentionDays: number;
  maxWorkspaces: number;
  maxMembers: number;
  maxProjects: number;
  features: OrganizationFeatures;
}

export interface OrganizationFeatures {
  workspaces: boolean;
  projects: boolean;
  customRoles: boolean;
  sso: boolean;
  auditLogs: boolean;
  apiAccess: boolean;
  advancedSecurity: boolean;
  customBranding: boolean;
  multipleOwners: boolean;
  guestAccess: boolean;
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  favicon?: string;
  font?: string;
  customCss?: string;
  emailHeader?: string;
  emailFooter?: string;
}

export interface CreateOrganizationData {
  name: string;
  slug?: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  settings?: Partial<OrganizationSettings>;
}

export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  description?: string;
  domain?: string;
  logo_url?: string;
  industry?: string;
  size?: string;
  website?: string;
  settings?: Partial<OrganizationSettings>;
  branding?: Partial<BrandingConfig>;
}