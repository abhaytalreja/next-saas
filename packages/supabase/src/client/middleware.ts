import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from './config';
import type { Database } from '../types/supabase';

/**
 * Create a Supabase client for Next.js middleware
 * This handles auth token refresh and session management
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const config = getSupabaseConfig();

  const supabase = createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
      auth: config.options?.auth,
      db: config.options?.db,
      global: config.options?.global,
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

/**
 * Middleware configuration for protected routes
 */
export const protectedPaths = [
  '/dashboard',
  '/settings',
  '/projects',
  '/admin',
  '/api/protected',
];

/**
 * Check if a path requires authentication
 */
export function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(path => pathname.startsWith(path));
}

/**
 * Get redirect URL for authentication
 */
export function getAuthRedirectUrl(request: NextRequest): string {
  const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
  const encodedRedirect = encodeURIComponent(redirectTo);
  return `/login?redirectTo=${encodedRedirect}`;
}