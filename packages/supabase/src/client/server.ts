import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './config';
import type { Database } from '../types/supabase';

/**
 * Create a Supabase client for server-side usage (App Router)
 * This client uses cookies for auth and respects RLS policies
 */
export function createSupabaseServerClient(): SupabaseClient<Database> {
  const cookieStore = cookies();
  const config = getSupabaseConfig();

  return createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: config.options?.auth,
      db: config.options?.db,
      global: config.options?.global,
    }
  );
}

/**
 * Create a Supabase client for API routes
 */
export function createSupabaseRouteHandlerClient(): SupabaseClient<Database> {
  return createSupabaseServerClient();
}

/**
 * Create a Supabase client for server actions
 */
export function createSupabaseServerActionClient(): SupabaseClient<Database> {
  return createSupabaseServerClient();
}