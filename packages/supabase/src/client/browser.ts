import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';
import type { Database } from '../types/supabase';

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Create a Supabase client for browser/client-side usage
 * This client uses the anon key and respects RLS policies
 */
export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient;
  }

  const config = getSupabaseConfig();

  browserClient = createBrowserClient<Database>(
    config.url,
    config.anonKey,
    {
      auth: config.options?.auth,
      db: config.options?.db,
      global: config.options?.global,
    }
  );

  return browserClient;
}

/**
 * Get or create the browser Supabase client
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }
  return browserClient;
}

/**
 * Clear the browser client (useful for testing or logout)
 */
export function clearSupabaseBrowserClient(): void {
  browserClient = null;
}