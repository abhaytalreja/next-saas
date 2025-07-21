import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './config';
import type { Database } from '../types/supabase';

/**
 * Create a Supabase client for server-side usage (App Router)
 * This client uses cookies for auth and respects RLS policies
 * Used for Server Components, Server Actions, and Route Handlers
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const config = getSupabaseConfig();

  return createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll();
          console.log('Server client - All cookies count:', allCookies.length);
          console.log('Server client - Cookie names:', allCookies.map(c => c.name));
          return allCookies;
        },
        setAll(cookiesToSet) {
          try {
            console.log('Server client - Setting cookies:', cookiesToSet.map(c => c.name));
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            console.log('Server client - Error setting cookies:', error);
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client for API routes
 */
export async function createSupabaseRouteHandlerClient(): Promise<SupabaseClient<Database>> {
  return await createSupabaseServerClient();
}

/**
 * Create a Supabase client for server actions
 */
export async function createSupabaseServerActionClient(): Promise<SupabaseClient<Database>> {
  return await createSupabaseServerClient();
}