/**
 * Zod validation schemas for database entities
 */

import { z } from 'zod';

// Common schemas
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email().toLowerCase();
export const urlSchema = z.string().url();
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/);
export const jsonSchema = z.record(z.any());

// Enum schemas
export const userRoleSchema = z.enum(['owner', 'admin', 'member']);
export const subscriptionStatusSchema = z.enum(['trial', 'active', 'cancelled', 'past_due', 'paused']);
export const paymentStatusSchema = z.enum(['pending', 'succeeded', 'failed', 'refunded']);
export const invoiceStatusSchema = z.enum(['draft', 'open', 'paid', 'void', 'uncollectible']);
export const notificationPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);
export const itemStatusSchema = z.enum(['active', 'archived', 'completed', 'cancelled']);
export const projectTypeSchema = z.enum(['general', 'real_estate', 'crypto', 'ecommerce', 'custom']);
export const fieldTypeSchema = z.enum(['text', 'number', 'date', 'select', 'multiselect', 'boolean', 'json', 'file']);
export const actionTypeSchema = z.enum(['INSERT', 'UPDATE', 'DELETE', 'ACCESS']);

// User schemas
export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(1).max(255).optional(),
  avatar_url: urlSchema.optional(),
  timezone: z.string().default('UTC'),
  locale: z.string().length(2).default('en'),
  metadata: jsonSchema.default({})
});

export const updateUserSchema = createUserSchema.partial();

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  slug: slugSchema.min(3).max(100),
  domain: z.string().optional(),
  logo_url: urlSchema.optional(),
  settings: jsonSchema.default({}),
  metadata: jsonSchema.default({})
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

// Membership schemas
export const createMembershipSchema = z.object({
  user_id: uuidSchema,
  organization_id: uuidSchema,
  role: userRoleSchema.default('member'),
  permissions: z.array(z.string()).default([])
});

export const updateMembershipSchema = z.object({
  role: userRoleSchema.optional(),
  permissions: z.array(z.string()).optional()
});

// Project schemas
export const createProjectSchema = z.object({
  organization_id: uuidSchema,
  name: z.string().min(1).max(255),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  type: projectTypeSchema.default('general'),
  settings: jsonSchema.default({}),
  metadata: jsonSchema.default({}),
  created_by: uuidSchema
});

export const updateProjectSchema = createProjectSchema.omit({ 
  organization_id: true, 
  created_by: true 
}).partial();

// Item schemas
export const createItemSchema = z.object({
  organization_id: uuidSchema,
  project_id: uuidSchema.optional(),
  parent_id: uuidSchema.optional(),
  type: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  data: jsonSchema.default({}),
  metadata: jsonSchema.default({}),
  status: itemStatusSchema.default('active'),
  priority: z.number().int().min(0).default(0),
  position: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  created_by: uuidSchema,
  assigned_to: uuidSchema.optional(),
  due_date: z.date().optional()
});

export const updateItemSchema = createItemSchema.omit({ 
  organization_id: true, 
  created_by: true 
}).partial();

// Category schemas
export const createCategorySchema = z.object({
  organization_id: uuidSchema,
  parent_id: uuidSchema.optional(),
  name: z.string().min(1).max(100),
  slug: slugSchema,
  description: z.string().optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  metadata: jsonSchema.default({}),
  position: z.number().int().min(0).default(0)
});

export const updateCategorySchema = createCategorySchema.omit({ 
  organization_id: true 
}).partial();

// Attachment schemas
export const createAttachmentSchema = z.object({
  organization_id: uuidSchema,
  entity_type: z.string().min(1).max(50),
  entity_id: uuidSchema,
  name: z.string().min(1).max(255),
  file_path: z.string(),
  file_size: z.number().int().positive(),
  mime_type: z.string().optional(),
  storage_provider: z.string().default('supabase'),
  metadata: jsonSchema.default({}),
  uploaded_by: uuidSchema
});

// Custom field schemas
export const createCustomFieldSchema = z.object({
  organization_id: uuidSchema,
  entity_type: z.string().min(1).max(100),
  field_name: z.string().min(1).max(100).regex(/^[a-z_][a-z0-9_]*$/),
  field_label: z.string().min(1).max(255),
  field_type: fieldTypeSchema,
  field_options: jsonSchema.default({}),
  validation_rules: jsonSchema.default({}),
  default_value: z.any().optional(),
  is_required: z.boolean().default(false),
  is_searchable: z.boolean().default(true),
  is_visible: z.boolean().default(true),
  help_text: z.string().optional(),
  sort_order: z.number().int().min(0).default(0)
});

export const updateCustomFieldSchema = createCustomFieldSchema.omit({ 
  organization_id: true,
  entity_type: true,
  field_name: true
}).partial();

// Notification schemas
export const createNotificationSchema = z.object({
  user_id: uuidSchema,
  organization_id: uuidSchema.optional(),
  type: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  message: z.string().optional(),
  action_url: urlSchema.optional(),
  action_label: z.string().max(100).optional(),
  data: jsonSchema.default({}),
  priority: notificationPrioritySchema.default('normal')
});

// Activity schemas
export const createActivitySchema = z.object({
  organization_id: uuidSchema,
  project_id: uuidSchema.optional(),
  user_id: uuidSchema,
  action: z.string().min(1).max(100),
  entity_type: z.string().optional(),
  entity_id: uuidSchema.optional(),
  entity_title: z.string().max(255).optional(),
  description: z.string().optional(),
  metadata: jsonSchema.default({}),
  is_public: z.boolean().default(true)
});

// API Key schemas
export const createApiKeySchema = z.object({
  organization_id: uuidSchema,
  name: z.string().min(1).max(255),
  permissions: z.array(z.string()).default([]),
  rate_limit: z.number().int().positive().default(1000),
  expires_at: z.date().optional()
});

// Billing schemas
export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  slug: slugSchema,
  description: z.string().optional(),
  price_monthly: z.number().int().min(0).optional(),
  price_yearly: z.number().int().min(0).optional(),
  currency: z.string().length(3).default('USD'),
  features: z.array(z.string()).default([]),
  limits: jsonSchema.default({}),
  metadata: jsonSchema.default({}),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  stripe_price_id_monthly: z.string().optional(),
  stripe_price_id_yearly: z.string().optional(),
  stripe_product_id: z.string().optional(),
  sort_order: z.number().int().min(0).default(0)
});

export const updatePlanSchema = createPlanSchema.partial();

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Helper function for safe validation
export function safeValidateData<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  error?: z.ZodError 
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}