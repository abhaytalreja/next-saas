// Authentication-related constants

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  REFRESH_THRESHOLD: 5 * 60, // 5 minutes before expiry
  MAX_AGE: 7 * 24 * 60 * 60, // 7 days
  IDLE_TIMEOUT: 30 * 60, // 30 minutes
  REMEMBER_ME_MAX_AGE: 30 * 24 * 60 * 60, // 30 days
} as const

/**
 * Password requirements
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
} as const

/**
 * OAuth provider configuration
 */
export const OAUTH_PROVIDERS = {
  google: {
    name: 'Google',
    scopes: ['email', 'profile'],
  },
  github: {
    name: 'GitHub',
    scopes: ['user:email'],
  },
  microsoft: {
    name: 'Microsoft',
    scopes: ['email', 'profile'],
  },
  apple: {
    name: 'Apple',
    scopes: ['email', 'name'],
  },
} as const

/**
 * Authentication routes
 */
export const AUTH_ROUTES = {
  LOGIN: '/auth/sign-in',
  SIGNUP: '/auth/sign-up',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  CALLBACK: '/auth/callback',
  ERROR: '/auth/error',
  LOGOUT: '/auth/logout',
} as const

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/organization',
  '/admin',
] as const

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/blog',
  '/docs',
  '/terms',
  '/privacy',
] as const

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
} as const

/**
 * Token expiry times
 */
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 60 * 60, // 1 hour
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
  EMAIL_VERIFICATION: 24 * 60 * 60, // 24 hours
  PASSWORD_RESET: 60 * 60, // 1 hour
  INVITATION: 7 * 24 * 60 * 60, // 7 days
} as const

/**
 * Organization roles hierarchy
 * Higher number = more permissions
 */
export const ROLE_HIERARCHY = {
  viewer: 10,
  member: 20,
  billing: 30,
  admin: 40,
  owner: 50,
} as const

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES = {
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  emailNotifications: {
    marketing: true,
    productUpdates: true,
    securityAlerts: true,
    organizationInvites: true,
    projectUpdates: true,
    weeklyDigest: true,
  },
  pushNotifications: {
    enabled: false,
    mentions: true,
    messages: true,
    reminders: true,
    securityAlerts: true,
  },
} as const
