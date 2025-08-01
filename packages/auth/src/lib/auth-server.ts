import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { getConfig } from '@nextsaas/config'

/**
 * Create a Supabase client for server-side operations
 * This client has access to the service role key for admin operations
 */
export function createSupabaseServerClient(): SupabaseClient {
  const config = getConfig()

  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    throw new Error(
      'Supabase server configuration is missing. Please check your environment variables.'
    )
  }

  return createServerClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'nextsaas-auth-server',
        },
      },
    }
  )
}

/**
 * Create a Supabase client for server-side operations with user context
 * This client uses the user's access token for RLS-enabled operations
 */
export async function createSupabaseServerClientWithAuth(): Promise<SupabaseClient> {
  const config = getConfig()
  const cookieStore = await cookies()

  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error(
      'Supabase configuration is missing. Please check your environment variables.'
    )
  }

  return createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: any[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }: any) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'nextsaas-auth-server-user',
      },
    },
  })
}

/**
 * Create a Supabase client for middleware operations
 */
export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
): SupabaseClient {
  const config = getConfig()

  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error(
      'Supabase configuration is missing. Please check your environment variables.'
    )
  }

  return createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }: any) => {
          request.cookies.set({ name, value })
          response.cookies.set(name, value, options)
        })
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'nextsaas-auth-middleware',
      },
    },
  })
}

/**
 * Get the current user from server-side context
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClientWithAuth()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}

/**
 * Get the current session from server-side context
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    const supabase = await createSupabaseServerClientWithAuth()

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) {
      return null
    }

    return session
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}

/**
 * Validate a JWT token server-side
 */
export async function validateAuthToken(token: string): Promise<User | null> {
  try {
    const supabase = createSupabaseServerClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error validating auth token:', error)
    return null
  }
}

/**
 * Create a user with admin privileges
 */
export async function createUserWithAdmin(
  email: string,
  password: string,
  userData: any
) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: userData,
    email_confirm: true,
  })

  if (error) {
    throw error
  }

  return data.user
}

/**
 * Update user metadata with admin privileges
 */
export async function updateUserMetadata(userId: string, metadata: any) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  })

  if (error) {
    throw error
  }

  return data.user
}

/**
 * Delete a user with admin privileges
 */
export async function deleteUser(userId: string) {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    throw error
  }
}
