import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';
import type { Database } from '../types/supabase';

let adminClient: SupabaseClient<Database> | null = null;

/**
 * Create a Supabase admin client with service role key
 * WARNING: This bypasses RLS policies. Only use on the server!
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used in the browser!');
  }

  if (adminClient) {
    return adminClient;
  }

  const config = getSupabaseConfig();

  if (!config.serviceRoleKey) {
    throw new Error('Service role key is required for admin client');
  }

  adminClient = createClient<Database>(
    config.url,
    config.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      db: config.options?.db,
      global: {
        ...config.options?.global,
        headers: {
          ...config.options?.global?.headers,
          'x-supabase-role': 'service_role',
        },
      },
    }
  );

  return adminClient;
}

/**
 * Get or create the admin Supabase client
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!adminClient) {
    adminClient = createSupabaseAdminClient();
  }
  return adminClient;
}

/**
 * Clear the admin client (useful for testing)
 */
export function clearSupabaseAdminClient(): void {
  adminClient = null;
}