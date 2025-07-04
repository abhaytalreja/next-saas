/**
 * Database table type definitions
 * These will be auto-generated in the future
 */

import type { 
  BaseEntity, 
  BaseEntityWithSoftDelete,
  UUID, 
  JSONObject,
  UserRole,
  SubscriptionStatus,
  PaymentStatus,
  InvoiceStatus,
  NotificationPriority,
  ItemStatus,
  ProjectType,
  FieldType,
  ActionType
} from './base';

// Core tables
export interface User extends BaseEntityWithSoftDelete {
  email: string;
  email_verified_at: Date | null;
  name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  metadata: JSONObject;
  last_seen_at: Date | null;
}

export interface Organization extends BaseEntityWithSoftDelete {
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  settings: JSONObject;
  metadata: JSONObject;
  subscription_status: SubscriptionStatus;
  trial_ends_at: Date | null;
  created_by: UUID | null;
}

export interface Membership extends BaseEntity {
  user_id: UUID;
  organization_id: UUID;
  role: UserRole;
  permissions: string[];
  invited_by: UUID | null;
  invited_at: Date | null;
  accepted_at: Date | null;
}

// Auth tables
export interface Session extends BaseEntity {
  user_id: UUID;
  token: string;
  ip_address: string | null;
  user_agent: string | null;
  device_info: JSONObject;
  expires_at: Date;
}

export interface OAuthAccount extends BaseEntity {
  user_id: UUID;
  provider: string;
  provider_account_id: string;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: Date | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

// Billing tables
export interface Plan extends BaseEntity {
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  currency: string;
  features: string[];
  limits: JSONObject;
  metadata: JSONObject;
  is_active: boolean;
  is_default: boolean;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  stripe_product_id: string | null;
  sort_order: number;
}

export interface Subscription extends BaseEntity {
  organization_id: UUID;
  plan_id: UUID | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: SubscriptionStatus;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: Date | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  canceled_at: Date | null;
  trial_start: Date | null;
  trial_end: Date | null;
  metadata: JSONObject;
}

export interface Invoice extends BaseEntity {
  organization_id: UUID;
  subscription_id: UUID | null;
  stripe_invoice_id: string | null;
  invoice_number: string | null;
  status: InvoiceStatus;
  amount_total: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  line_items: JSONObject[];
  billing_details: JSONObject;
  due_date: Date | null;
  paid_at: Date | null;
  metadata: JSONObject;
}

export interface Payment extends BaseEntity {
  organization_id: UUID;
  invoice_id: UUID | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  payment_method_details: JSONObject;
  failure_reason: string | null;
  refunded_amount: number;
  metadata: JSONObject;
}

export interface UsageTracking extends BaseEntity {
  organization_id: UUID;
  feature: string;
  usage_count: number;
  usage_limit: number | null;
  period_start: Date;
  period_end: Date;
  metadata: JSONObject;
}

// Content tables
export interface Project extends BaseEntityWithSoftDelete {
  organization_id: UUID;
  name: string;
  slug: string | null;
  description: string | null;
  type: ProjectType;
  settings: JSONObject;
  metadata: JSONObject;
  is_archived: boolean;
  created_by: UUID;
}

export interface Item extends BaseEntityWithSoftDelete {
  organization_id: UUID;
  project_id: UUID | null;
  parent_id: UUID | null;
  type: string;
  title: string;
  slug: string | null;
  description: string | null;
  content: string | null;
  data: JSONObject;
  metadata: JSONObject;
  status: ItemStatus;
  priority: number;
  position: number;
  tags: string[];
  created_by: UUID;
  assigned_to: UUID | null;
  due_date: Date | null;
  completed_at: Date | null;
}

export interface Category extends BaseEntity {
  organization_id: UUID;
  parent_id: UUID | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  metadata: JSONObject;
  position: number;
}

export interface Attachment extends BaseEntity {
  organization_id: UUID;
  entity_type: string;
  entity_id: UUID;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  storage_provider: string;
  metadata: JSONObject;
  uploaded_by: UUID;
}

export interface CustomField extends BaseEntity {
  organization_id: UUID;
  entity_type: string;
  field_name: string;
  field_label: string;
  field_type: FieldType;
  field_options: JSONObject;
  validation_rules: JSONObject;
  default_value: any;
  is_required: boolean;
  is_searchable: boolean;
  is_visible: boolean;
  help_text: string | null;
  sort_order: number;
}

export interface CustomFieldValue extends BaseEntity {
  custom_field_id: UUID;
  entity_id: UUID;
  value: any;
}

// System tables
export interface AuditLog {
  id: UUID;
  organization_id: UUID | null;
  user_id: UUID | null;
  table_name: string;
  record_id: UUID;
  action: ActionType;
  old_data: JSONObject | null;
  new_data: JSONObject | null;
  changed_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: UUID | null;
  request_id: string | null;
  created_at: Date;
}

export interface Activity {
  id: UUID;
  organization_id: UUID;
  project_id: UUID | null;
  user_id: UUID;
  action: string;
  entity_type: string | null;
  entity_id: UUID | null;
  entity_title: string | null;
  description: string | null;
  metadata: JSONObject;
  is_public: boolean;
  created_at: Date;
}

export interface Notification {
  id: UUID;
  user_id: UUID;
  organization_id: UUID | null;
  type: string;
  title: string;
  message: string | null;
  action_url: string | null;
  action_label: string | null;
  data: JSONObject;
  priority: NotificationPriority;
  read_at: Date | null;
  clicked_at: Date | null;
  created_at: Date;
}

export interface FeatureFlag extends BaseEntity {
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rollout_percentage: number;
  conditions: JSONObject;
  metadata: JSONObject;
}

export interface FeatureFlagOverride extends BaseEntity {
  feature_flag_id: UUID;
  organization_id: UUID;
  enabled: boolean;
  metadata: JSONObject;
}

export interface SystemSetting extends BaseEntity {
  category: string;
  key: string;
  value: any;
  type: string;
  description: string | null;
  is_public: boolean;
  is_encrypted: boolean;
}

export interface ApiKey {
  id: UUID;
  organization_id: UUID;
  name: string;
  key_hash: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number;
  expires_at: Date | null;
  last_used_at: Date | null;
  created_by: UUID;
  created_at: Date;
  revoked_at: Date | null;
}

// Junction tables
export interface ItemCategory {
  item_id: UUID;
  category_id: UUID;
  created_at: Date;
}