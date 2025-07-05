// Client-only exports - includes React hooks and browser-specific code

// Browser client exports
export {
  createSupabaseBrowserClient,
  getSupabaseBrowserClient,
  clearSupabaseBrowserClient,
} from './client/browser';

// Client-side auth hooks
export * from './auth/hooks/use-auth';
export * from './auth/hooks/use-session';

// Real-time hooks (client-side)
export * from './realtime/hooks/use-realtime';
export * from './realtime/hooks/use-presence';

// Re-export types that client code might need
export * from './auth/types';
export type { Database } from './types/supabase';
export type { Json } from './types/supabase';