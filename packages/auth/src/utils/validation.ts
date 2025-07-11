import { z } from 'zod'

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  )

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')

// Name validation schema
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(
    /^[a-zA-Z\s\-']+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  )

// Organization name validation schema
export const organizationNameSchema = z
  .string()
  .max(100, 'Organization name must be less than 100 characters')
  .regex(
    /^[a-zA-Z0-9\s\-_&.]*$/,
    'Organization name contains invalid characters'
  )
  .or(z.literal(''))

// Sign up schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  organizationName: organizationNameSchema.optional(),
})

// Sign in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

// Reset password schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
  redirectTo: z.string().url().optional(),
})

// Update password schema
export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Magic link schema
export const magicLinkSchema = z.object({
  email: emailSchema,
  redirectTo: z.string().url().optional(),
})

// Phone schema
export const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  password: passwordSchema.optional(),
  token: z.string().optional(),
})

// Two-factor schema
export const twoFactorSchema = z.object({
  token: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit code'),
  backupCode: z.string().optional(),
})

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
})

// Organization creation schema
export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    )
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  industry: z.string().optional(),
  size: z
    .enum(['startup', 'small', 'medium', 'large', 'enterprise'])
    .optional(),
  website: z.string().url().optional(),
})

// Organization update schema
export const updateOrganizationSchema = z.object({
  name: organizationNameSchema.optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z
    .enum(['startup', 'small', 'medium', 'large', 'enterprise'])
    .optional(),
})

// Member invitation schema
export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['owner', 'admin', 'member', 'viewer', 'billing']),
  permissions: z.array(z.string()).optional(),
  message: z
    .string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
})

// Preferences schema
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.enum(['12h', '24h']),
  emailNotifications: z.object({
    marketing: z.boolean(),
    productUpdates: z.boolean(),
    securityAlerts: z.boolean(),
    organizationInvites: z.boolean(),
    projectUpdates: z.boolean(),
    weeklyDigest: z.boolean(),
  }),
  pushNotifications: z.object({
    enabled: z.boolean(),
    mentions: z.boolean(),
    messages: z.boolean(),
    reminders: z.boolean(),
    securityAlerts: z.boolean(),
  }),
})

// Organization settings schema
export const organizationSettingsSchema = z.object({
  allowMemberInvites: z.boolean(),
  requireEmailVerification: z.boolean(),
  requireTwoFactor: z.boolean(),
  sessionTimeout: z.number().min(5).max(1440), // 5 minutes to 24 hours
  ipWhitelist: z.array(z.string().ip()).optional(),
  ssoEnabled: z.boolean(),
  ssoProvider: z.string().optional(),
  customDomain: z.string().optional(),
  brandingEnabled: z.boolean(),
})

// Utility functions for validation
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

export function getPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')

  if (password.length >= 12) score += 1
  else feedback.push('Use 12 or more characters for better security')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Include lowercase letters')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Include uppercase letters')

  if (/\d/.test(password)) score += 1
  else feedback.push('Include numbers')

  if (/[@$!%*?&]/.test(password)) score += 1
  else feedback.push('Include special characters')

  if (!/(.)\1{2,}/.test(password)) score += 1
  else feedback.push('Avoid repeated characters')

  return { score, feedback }
}

export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach(issue => {
    const path = issue.path.join('.')
    errors[path] = issue.message
  })

  return { success: false, errors }
}

// Export all schemas for use in forms
export const schemas = {
  signUp: signUpSchema,
  signIn: signInSchema,
  resetPassword: resetPasswordSchema,
  updatePassword: updatePasswordSchema,
  magicLink: magicLinkSchema,
  phone: phoneSchema,
  twoFactor: twoFactorSchema,
  updateProfile: updateProfileSchema,
  createOrganization: createOrganizationSchema,
  updateOrganization: updateOrganizationSchema,
  inviteMember: inviteMemberSchema,
  userPreferences: userPreferencesSchema,
  organizationSettings: organizationSettingsSchema,
}
