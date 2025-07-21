// Client-only exports - safe for browser usage
export {
  createSupabaseBrowserClient,
  getSupabaseBrowserClient,
  clearSupabaseBrowserClient,
} from './client/browser';

export { getSupabaseConfig, isServer, isDevelopment, isProduction } from './client/config';

// Authentication exports
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
export * from './auth/providers/email-auth';
export * from './auth/providers/oauth-providers';
export * from './auth/providers/magic-link';
export * from './auth/providers/phone-auth';

// Database exports (client-safe)
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

// Storage exports
export * from './storage/types';
export { StorageClient } from './storage/storage-client';
export { getStorageConfig, storageBuckets, getBucketConfig } from './storage/config';

// Real-time exports
export * from './realtime/types';
export { SubscriptionManager } from './realtime/subscription-manager';

// Utility exports
export * from './utils/error-handler';

// Type exports
export type { Database } from './types/supabase';
export type { Json } from './types/supabase';