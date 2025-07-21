// Server-only exports - contains next/headers and other server-side functionality
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

export {
  updateSession,
  protectedPaths,
  isProtectedPath,
  getAuthRedirectUrl,
} from './client/middleware';

// Re-export client-safe utilities for server use
export { getSupabaseConfig, isServer, isDevelopment, isProduction } from './client/config';

// Database operations that might need server context
export * from './database/operations/users';
export * from './database/operations/organizations';
export * from './database/helpers/query-builder';

// Type exports
export type { Database } from './types/supabase';
export type { Json } from './types/supabase';