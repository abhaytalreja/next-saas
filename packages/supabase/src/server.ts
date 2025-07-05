// Server-only exports - no React hooks or client-side code

// Server client exports
export {
  createSupabaseServerClient,
  createSupabaseRouteHandlerClient,
  createSupabaseServerActionClient,
} from './client/server';

export {
  createSupabaseAdminClient,
  getSupabaseAdminClient,
  clearSupabaseAdminClient,
} from './client/admin';

// Middleware exports (server-side)
export {
  updateSession,
  protectedPaths,
  isProtectedPath,
  getAuthRedirectUrl,
} from './client/middleware';

// Config exports
export { getSupabaseConfig, isServer, isDevelopment, isProduction } from './client/config';

// Database exports (server-safe)
export * from './database/types/database';
export {
  uuidSchema as dbUuidSchema,
  paginationSchema,
  orderBySchema,
  filterSchema,
  queryOptionsSchema as dbQueryOptionsSchema,
  softDeleteSchema,
  timestampSchema,
  metadataSchema
} from './database/validation';
export * from './database/operations/users';
export * from './database/operations/organizations';
export * from './database/helpers/query-builder';

// Storage exports (server-safe)
export * from './storage/types';
export { StorageClient } from './storage/storage-client';
export { getStorageConfig, storageBuckets, getBucketConfig } from './storage/config';

// Real-time exports (server-safe)
export * from './realtime/types';
export { SubscriptionManager } from './realtime/subscription-manager';

// Utility exports
export * from './utils/error-handler';

// Type exports
export type { Database } from './types/supabase';
export type { Json } from './types/supabase';

// Auth types and validation (server-safe)
export * from './auth/types';
export {
  emailSchema,
  passwordSchema,
  phoneSchema,
  signInSchema,
  signUpSchema,
  oauthProviderSchema,
  magicLinkSchema,
  phoneAuthSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  organizationSlugSchema,
  userProfileSchema,
  createOrganizationSchema as authCreateOrganizationSchema
} from './auth/validation';

// Server-side auth providers
export {
  signInWithEmail,
  signUpWithEmail,
  resetPasswordForEmail,
  updateUserPassword,
  confirmPasswordReset,
  verifyOTP
} from './auth/providers/email-auth';

export {
  OAuthProvider,
  signInWithOAuth,
  linkOAuthAccount,
  unlinkOAuthAccount,
  getOAuthUrl
} from './auth/providers/oauth-providers';

export {
  sendMagicLink,
  verifyMagicLink
} from './auth/providers/magic-link';

export {
  sendPhoneOTP,
  verifyPhoneOTP,
  updatePhoneNumber
} from './auth/providers/phone-auth';