export interface OrganizationBilling {
  organization_id: string;
  stripe_customer_id?: string;
  payment_method_id?: string;
  billing_email?: string;
  billing_name?: string;
  billing_address?: BillingAddress;
  tax_id?: string;
  tax_exempt?: boolean;
  currency: string;
  payment_status: 'active' | 'past_due' | 'cancelled' | 'paused';
  next_billing_date?: string;
  cancellation_date?: string;
  metadata?: Record<string, any>;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface UsageMetric {
  id: string;
  organization_id: string;
  metric_name: string;
  display_name: string;
  unit: string;
  current_usage: number;
  limit: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  reset_date: string;
  overage_allowed: boolean;
  overage_rate?: number;
  metadata?: Record<string, any>;
}

export interface BillingHistory {
  id: string;
  organization_id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  period_start: string;
  period_end: string;
  payment_date?: string;
  payment_method?: string;
  invoice_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'paused';
  current_period_start: string;
  current_period_end: string;
  cancel_at?: string;
  cancelled_at?: string;
  trial_start?: string;
  trial_end?: string;
  quantity: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: PlanFeatures;
  limits: PlanLimits;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  is_active: boolean;
  is_default: boolean;
  is_custom: boolean;
  sort_order: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlanFeatures {
  workspaces: boolean;
  custom_roles: boolean;
  sso: boolean;
  audit_logs: boolean;
  api_access: boolean;
  advanced_security: boolean;
  custom_branding: boolean;
  priority_support: boolean;
  dedicated_account_manager: boolean;
  sla: boolean;
  [key: string]: boolean;
}

export interface PlanLimits {
  max_workspaces: number;
  max_members: number;
  max_projects: number;
  max_storage_gb: number;
  max_api_calls_per_month: number;
  max_file_uploads_per_month: number;
  data_retention_days: number;
  audit_log_retention_days: number;
  [key: string]: number;
}

export interface QuotaUsage {
  organization_id: string;
  workspaces_used: number;
  members_used: number;
  projects_used: number;
  storage_used_gb: number;
  api_calls_this_month: number;
  file_uploads_this_month: number;
  last_updated: string;
}