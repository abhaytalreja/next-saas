import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

/**
 * Password validation schema with security requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

/**
 * Phone number validation schema
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

/**
 * Sign in credentials validation
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Sign up credentials validation
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(1, 'Name is required').max(100),
  organizationName: z.string().min(1, 'Organization name is required').max(100).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * OAuth provider validation
 */
export const oauthProviderSchema = z.object({
  provider: z.enum(['google', 'github', 'gitlab', 'bitbucket', 'azure', 'discord', 'facebook', 'twitter']),
  redirectTo: z.string().url().optional(),
  scopes: z.string().optional(),
  queryParams: z.record(z.string()).optional(),
});

/**
 * Magic link validation
 */
export const magicLinkSchema = z.object({
  email: emailSchema,
  redirectTo: z.string().url().optional(),
});

/**
 * Phone authentication validation
 */
export const phoneAuthSchema = z.object({
  phone: phoneSchema,
  password: z.string().optional(),
  channel: z.enum(['sms', 'whatsapp']).optional(),
});

/**
 * Password reset validation
 */
export const resetPasswordSchema = z.object({
  email: emailSchema,
  redirectTo: z.string().url().optional(),
});

/**
 * Update password validation
 */
export const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * Organization slug validation
 */
export const organizationSlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be less than 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .regex(/^[a-z0-9]/, 'Slug must start with a letter or number')
  .regex(/[a-z0-9]$/, 'Slug must end with a letter or number');

/**
 * User profile validation
 */
export const userProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().optional().nullable(),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en'),
  metadata: z.record(z.any()).default({}),
});

/**
 * Organization creation validation
 */
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100),
  slug: organizationSlugSchema,
  domain: z.string().url().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  settings: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({}),
});