import { z } from 'zod'

// Common validation patterns
const emailSchema = z.string().email('Invalid email address')
const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format').optional().or(z.literal(''))
const urlSchema = z.string().url('Invalid URL format').optional().or(z.literal(''))
const timezoneSchema = z.string().min(1, 'Timezone is required')
const localeSchema = z.string().min(2, 'Locale must be at least 2 characters')

// Profile validation schemas
export const profileFormSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'First name can only contain letters and spaces'),
  
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'Last name can only contain letters and spaces'),
  
  display_name: z.string()
    .max(100, 'Display name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\u00C0-\u017F._-]*$/, 'Display name contains invalid characters')
    .optional(),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  phone: phoneSchema,
  
  website: urlSchema,
  
  job_title: z.string()
    .max(100, 'Job title must be less than 100 characters')
    .optional(),
  
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  
  department: z.string()
    .max(100, 'Department must be less than 100 characters')
    .optional(),
  
  location: z.string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  
  timezone: timezoneSchema,
  locale: localeSchema,
})

// Basic profile update schema (subset of full profile)
export const basicProfileUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  bio: z.string().max(500).optional(),
  phone: phoneSchema,
  website: urlSchema,
  timezone: timezoneSchema,
  locale: localeSchema,
})

// User preferences validation schema
export const userPreferencesSchema = z.object({
  // Theme & Appearance
  theme: z.enum(['light', 'dark', 'system'], {
    errorMap: () => ({ message: 'Theme must be light, dark, or system' })
  }).default('system'),
  
  language: z.string()
    .min(2, 'Language code must be at least 2 characters')
    .max(10, 'Language code must be less than 10 characters')
    .default('en'),
  
  date_format: z.string()
    .min(1, 'Date format is required')
    .max(20, 'Date format must be less than 20 characters')
    .default('MM/dd/yyyy'),
  
  time_format: z.enum(['12h', '24h'], {
    errorMap: () => ({ message: 'Time format must be 12h or 24h' })
  }).default('12h'),
  
  // Email Notifications
  email_notifications_enabled: z.boolean().default(true),
  email_frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).default('immediate'),
  email_digest: z.boolean().default(true),
  
  // Notification Types
  notify_security_alerts: z.boolean().default(true),
  notify_account_updates: z.boolean().default(true),
  notify_organization_updates: z.boolean().default(true),
  notify_project_updates: z.boolean().default(true),
  notify_mentions: z.boolean().default(true),
  notify_comments: z.boolean().default(true),
  notify_invitations: z.boolean().default(true),
  notify_billing_alerts: z.boolean().default(true),
  notify_feature_announcements: z.boolean().default(false),
  
  // Push Notifications
  browser_notifications_enabled: z.boolean().default(false),
  desktop_notifications_enabled: z.boolean().default(false),
  mobile_notifications_enabled: z.boolean().default(false),
  
  // Marketing & Communication
  marketing_emails: z.boolean().default(false),
  product_updates: z.boolean().default(true),
  newsletters: z.boolean().default(false),
  surveys: z.boolean().default(false),
  
  // Privacy Settings
  profile_visibility: z.enum(['public', 'organization', 'private']).default('organization'),
  email_visibility: z.enum(['public', 'organization', 'private']).default('organization'),
  activity_visibility: z.enum(['public', 'organization', 'private']).default('organization'),
  hide_last_seen: z.boolean().default(false),
  hide_activity_status: z.boolean().default(false),
  
  // Advanced Settings
  quiet_hours_enabled: z.boolean().default(false),
  quiet_hours_start: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .default('22:00'),
  quiet_hours_end: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .default('08:00'),
  timezone_aware: z.boolean().default(true),
  
  // Accessibility
  reduce_motion: z.boolean().default(false),
  high_contrast: z.boolean().default(false),
  screen_reader_optimized: z.boolean().default(false),
  
  // Data & Privacy
  data_retention_period: z.number()
    .min(30, 'Data retention must be at least 30 days')
    .max(2555, 'Data retention cannot exceed 7 years')
    .default(365),
  auto_delete_inactive: z.boolean().default(false),
})

// Partial preferences update schema (for individual setting updates)
export const preferencesUpdateSchema = userPreferencesSchema.partial()

// Avatar upload validation
export const avatarUploadSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, 'File is required'),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
  quality: z.number().min(0.1).max(1).default(0.9),
  outputSize: z.number().min(50).max(1024).default(256),
}).refine((data) => {
  return data.file.size <= data.maxSize
}, {
  message: 'File size exceeds maximum allowed size',
  path: ['file']
}).refine((data) => {
  return data.allowedTypes.includes(data.file.type)
}, {
  message: 'File type not allowed',
  path: ['file']
})

// Avatar metadata schema
export const avatarMetadataSchema = z.object({
  original_filename: z.string().max(255).optional(),
  file_size: z.number().positive('File size must be positive'),
  mime_type: z.string().min(1, 'MIME type is required'),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  uploaded_via: z.string().max(50).default('web'),
  upload_session_id: z.string().max(255).optional(),
})

// Activity logging schema
export const activityLogSchema = z.object({
  action: z.string()
    .min(1, 'Action is required')
    .max(100, 'Action must be less than 100 characters'),
  
  resource: z.string()
    .max(100, 'Resource must be less than 100 characters')
    .optional(),
  
  resource_id: z.string().uuid().optional(),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  metadata: z.record(z.any()).optional(),
  
  ip_address: z.string().ip().optional(),
  user_agent: z.string().max(1000).optional(),
  device_type: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  browser: z.string().max(50).optional(),
  os: z.string().max(50).optional(),
  location_country: z.string().length(2).optional(),
  location_city: z.string().max(100).optional(),
  session_id: z.string().max(255).optional(),
  organization_id: z.string().uuid().optional(),
  status: z.enum(['success', 'failure', 'pending']).default('success'),
  error_message: z.string().optional(),
})

// Session management schema
export const sessionSchema = z.object({
  device_name: z.string()
    .max(255, 'Device name must be less than 255 characters')
    .optional(),
  
  device_type: z.enum(['desktop', 'mobile', 'tablet']),
  device_fingerprint: z.string().max(255).optional(),
  browser: z.string().max(50).optional(),
  browser_version: z.string().max(20).optional(),
  os: z.string().max(50).optional(),
  os_version: z.string().max(20).optional(),
  user_agent: z.string().optional(),
  ip_address: z.string().ip(),
  location_country: z.string().length(2).optional(),
  location_region: z.string().max(100).optional(),
  location_city: z.string().max(100).optional(),
  isp: z.string().max(255).optional(),
  is_trusted: z.boolean().default(false),
  organization_id: z.string().uuid().optional(),
  organization_role: z.string().max(50).optional(),
})

// Data export request schema
export const dataExportSchema = z.object({
  include_profile: z.boolean().default(true),
  include_preferences: z.boolean().default(true),
  include_activity: z.boolean().default(true),
  include_sessions: z.boolean().default(false),
  include_avatars: z.boolean().default(true),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  format: z.enum(['json', 'csv']).default('json'),
})

// Account deletion schema
export const accountDeletionSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT', {
    errorMap: () => ({ message: 'You must type "DELETE MY ACCOUNT" to confirm' })
  }),
  reason: z.enum([
    'no_longer_needed',
    'privacy_concerns',
    'switching_service',
    'too_expensive',
    'technical_issues',
    'other'
  ]).optional(),
  feedback: z.string().max(1000).optional(),
  delete_immediately: z.boolean().default(false),
})

// Query schemas for API endpoints
export const activityQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  action: z.string().optional(),
  resource: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  status: z.enum(['success', 'failure', 'pending']).optional(),
})

export const sessionQuerySchema = z.object({
  active_only: z.coerce.boolean().default(true),
  include_revoked: z.coerce.boolean().default(false),
  device_type: z.enum(['desktop', 'mobile', 'tablet']).optional(),
})

// Profile completion calculation schema
export const profileCompletenessSchema = z.object({
  has_avatar: z.boolean(),
  has_bio: z.boolean(),
  has_phone: z.boolean(),
  has_website: z.boolean(),
  has_job_title: z.boolean(),
  has_company: z.boolean(),
  has_location: z.boolean(),
  preferences_configured: z.boolean(),
}).transform((data) => {
  const totalFields = Object.keys(data).length
  const completedFields = Object.values(data).filter(Boolean).length
  return Math.round((completedFields / totalFields) * 100)
})

// Security score calculation schema
export const securityScoreSchema = z.object({
  has_strong_password: z.boolean(),
  has_two_factor: z.boolean(),
  has_verified_email: z.boolean(),
  has_trusted_devices: z.boolean(),
  regular_activity: z.boolean(),
  privacy_configured: z.boolean(),
}).transform((data) => {
  const weights = {
    has_strong_password: 25,
    has_two_factor: 30,
    has_verified_email: 15,
    has_trusted_devices: 10,
    regular_activity: 10,
    privacy_configured: 10,
  }
  
  let score = 0
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      score += weights[key as keyof typeof weights]
    }
  }
  
  return Math.min(score, 100)
})

// Form validation helpers
export const validateProfileForm = (data: unknown) => {
  return profileFormSchema.safeParse(data)
}

export const validatePreferences = (data: unknown) => {
  return userPreferencesSchema.safeParse(data)
}

export const validateAvatarUpload = (data: unknown) => {
  return avatarUploadSchema.safeParse(data)
}

export const validateActivityLog = (data: unknown) => {
  return activityLogSchema.safeParse(data)
}

export const validateDataExport = (data: unknown) => {
  return dataExportSchema.safeParse(data)
}

export const validateAccountDeletion = (data: unknown) => {
  return accountDeletionSchema.safeParse(data)
}

// Type exports for form data
export type ProfileFormData = z.infer<typeof profileFormSchema>
export type BasicProfileUpdateData = z.infer<typeof basicProfileUpdateSchema>
export type UserPreferencesData = z.infer<typeof userPreferencesSchema>
export type PreferencesUpdateData = z.infer<typeof preferencesUpdateSchema>
export type AvatarUploadData = z.infer<typeof avatarUploadSchema>
export type AvatarMetadataData = z.infer<typeof avatarMetadataSchema>
export type ActivityLogData = z.infer<typeof activityLogSchema>
export type SessionData = z.infer<typeof sessionSchema>
export type DataExportData = z.infer<typeof dataExportSchema>
export type AccountDeletionData = z.infer<typeof accountDeletionSchema>
export type ActivityQueryData = z.infer<typeof activityQuerySchema>
export type SessionQueryData = z.infer<typeof sessionQuerySchema>

// Validation error helper
export const getValidationErrors = (result: z.SafeParseReturnType<any, any>) => {
  if (!result.success) {
    return result.error.issues.reduce((acc, issue) => {
      const path = issue.path.join('.')
      acc[path] = issue.message
      return acc
    }, {} as Record<string, string>)
  }
  return {}
}