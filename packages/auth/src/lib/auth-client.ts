'use client';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get the Supabase client for browser environments
 * This client is used for all client-side authentication operations
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'nextsaas-auth-client'
        }
      }
    });
  }

  return supabaseClient;
}

/**
 * Reset the Supabase client instance
 * Used for testing or when configuration changes
 */
export function resetSupabaseClient(): void {
  supabaseClient = null;
}

/**
 * Get the current session from the Supabase client
 */
export async function getCurrentSession() {
  const client = getSupabaseBrowserClient();
  const { data: { session }, error } = await client.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
}

/**
 * Get the current user from the Supabase client
 */
export async function getCurrentUser() {
  const client = getSupabaseBrowserClient();
  const { data: { user }, error } = await client.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
}

/**
 * Listen for authentication state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const client = getSupabaseBrowserClient();
  return client.auth.onAuthStateChange(callback);
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const client = getSupabaseBrowserClient();
  const { error } = await client.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession() {
  const client = getSupabaseBrowserClient();
  const { data: { session }, error } = await client.auth.refreshSession();
  
  if (error) {
    console.error('Error refreshing session:', error);
    throw error;
  }
  
  return session;
}