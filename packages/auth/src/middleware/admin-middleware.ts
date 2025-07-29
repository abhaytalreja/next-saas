import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseMiddlewareClient } from '../lib/auth-server'
import type { MiddlewareConfig } from '../types'

export interface AdminUser {
  id: string
  email: string
  name: string
  is_system_admin: boolean
  permissions: string[]
  granted_at?: string
  metadata?: Record<string, any>
}

interface AdminMiddlewareConfig extends MiddlewareConfig {
  adminRoutes: string[]
  systemAdminRoutes: string[]
  requireSystemAdmin?: boolean
}

// Admin permission constants
export const ADMIN_PERMISSIONS = {
  // Dashboard access
  ACCESS_DASHBOARD: 'admin:access_dashboard',
  
  // User management
  MANAGE_USERS: 'admin:manage_users',
  VIEW_USERS: 'admin:view_users',
  SUSPEND_USERS: 'admin:suspend_users',
  IMPERSONATE_USERS: 'admin:impersonate_users',
  DELETE_USERS: 'admin:delete_users',
  
  // Organization management
  MANAGE_ORGANIZATIONS: 'admin:manage_organizations',
  VIEW_ORGANIZATIONS: 'admin:view_organizations',
  DELETE_ORGANIZATIONS: 'admin:delete_organizations',
  
  // Analytics and reporting
  VIEW_ANALYTICS: 'admin:view_analytics',
  EXPORT_DATA: 'admin:export_data',
  VIEW_REPORTS: 'admin:view_reports',
  
  // Billing and subscriptions
  MANAGE_BILLING: 'admin:manage_billing',
  VIEW_BILLING: 'admin:view_billing',
  
  // Email management
  MANAGE_EMAIL: 'admin:manage_email',
  VIEW_EMAIL_CAMPAIGNS: 'admin:view_email_campaigns',
  SEND_EMAILS: 'admin:send_emails',
  
  // Security monitoring
  MANAGE_SECURITY: 'admin:manage_security',
  VIEW_AUDIT_LOGS: 'admin:view_audit_logs',
  VIEW_SECURITY_EVENTS: 'admin:view_security_events',
  
  // System management
  MANAGE_SYSTEM: 'admin:manage_system',
  VIEW_SYSTEM_HEALTH: 'admin:view_system_health',
  MANAGE_SETTINGS: 'admin:manage_settings',
  
  // Feature management
  MANAGE_FEATURES: 'admin:manage_features',
  MANAGE_ANNOUNCEMENTS: 'admin:manage_announcements',
} as const

export type AdminPermissionType = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS]

const defaultAdminConfig: AdminMiddlewareConfig = {
  publicRoutes: [
    '/',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/auth/error',
  ],
  protectedRoutes: ['/dashboard', '/profile', '/organization', '/settings'],
  authRoutes: ['/auth/sign-in', '/auth/sign-up'],
  adminRoutes: ['/admin'],
  systemAdminRoutes: [
    '/admin/users',
    '/admin/organizations',
    '/admin/security',
    '/admin/system',
    '/admin/settings',
    '/admin/analytics'
  ],
  callbackUrl: '/auth/callback',
  loginUrl: '/auth/sign-in',
  unauthorizedUrl: '/unauthorized',
  requireSystemAdmin: true,
}

/**
 * Enhanced admin middleware that checks for system admin privileges
 */
export function createAdminMiddleware(config: Partial<AdminMiddlewareConfig> = {}) {
  const finalConfig = { ...defaultAdminConfig, ...config }

  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    const supabase = createSupabaseMiddlewareClient(request, response)

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const isAuthenticated = !!session?.user

    // Check if route is public
    const isPublicRoute = finalConfig.publicRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )

    // Check if route is auth route
    const isAuthRoute = finalConfig.authRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )

    // Check if route is admin route
    const isAdminRoute = finalConfig.adminRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )

    // Check if route requires system admin privileges
    const isSystemAdminRoute = finalConfig.systemAdminRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )

    // Redirect authenticated users away from auth routes
    if (isAuthenticated && isAuthRoute) {
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated && isAdminRoute) {
      const redirectUrl = new URL(finalConfig.loginUrl, request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Enhanced admin access check
    if (isAdminRoute && isAuthenticated) {
      try {
        // First check if user has system admin flag
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_system_admin')
          .eq('id', session.user.id)
          .single()

        if (userError || !userData?.is_system_admin) {
          console.warn(`Unauthorized admin access attempt by user ${session.user.id} to ${pathname}`)
          return NextResponse.redirect(new URL(finalConfig.unauthorizedUrl, request.url))
        }

        // For system admin routes, check active system admin record
        if (isSystemAdminRoute || finalConfig.requireSystemAdmin) {
          const { data: systemAdminData, error: systemAdminError } = await supabase
            .from('system_admins')
            .select('id, revoked_at, permissions')
            .eq('user_id', session.user.id)
            .is('revoked_at', null)
            .single()

          if (systemAdminError || !systemAdminData) {
            console.warn(`User ${session.user.id} lacks active system admin privileges for ${pathname}`)
            return NextResponse.redirect(new URL(finalConfig.unauthorizedUrl, request.url))
          }

          // Add admin info to headers for downstream use
          response.headers.set('x-admin-user-id', session.user.id)
          response.headers.set('x-admin-permissions', JSON.stringify(systemAdminData.permissions || []))
        }

        // Log admin access for audit purposes
        await supabase.rpc('log_system_admin_action', {
          admin_id: session.user.id,
          action_name: 'admin_route_access',
          target_type: 'route',
          action_details: { 
            route: pathname,
            method: request.method,
            timestamp: new Date().toISOString()
          },
          ip_addr: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
          user_agent_str: request.headers.get('user-agent') || 'unknown'
        })

      } catch (error) {
        console.error('Admin middleware error:', error)
        return NextResponse.redirect(new URL('/error', request.url))
      }
    }

    return response
  }
}

/**
 * Default admin middleware instance
 */
export const adminMiddleware = createAdminMiddleware()

/**
 * System admin middleware for highly sensitive routes
 */
export const systemAdminMiddleware = createAdminMiddleware({
  requireSystemAdmin: true,
  systemAdminRoutes: [
    '/admin/users',
    '/admin/organizations', 
    '/admin/security',
    '/admin/system',
    '/admin/settings',
    '/admin/analytics',
    '/admin/billing',
    '/admin/email'
  ]
})

/**
 * Helper function to check if user has admin privileges
 */
export async function isUserSystemAdmin(userId: string, supabase: any): Promise<boolean> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_system_admin')
      .eq('id', userId)
      .single()

    if (userError || !userData?.is_system_admin) {
      return false
    }

    const { data: systemAdminData, error: systemAdminError } = await supabase
      .from('system_admins')
      .select('id')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .single()

    return !systemAdminError && !!systemAdminData
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Admin route protection wrapper
 */
export function withAdminAuth(
  middleware: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config: Partial<AdminMiddlewareConfig> = {}
) {
  const adminMiddlewareInstance = createAdminMiddleware(config)

  return async function enhancedMiddleware(request: NextRequest) {
    // Run admin middleware first
    const adminResponse = await adminMiddlewareInstance(request)

    // If admin middleware returned a redirect, use it
    if (adminResponse.status === 307 || adminResponse.status === 308) {
      return adminResponse
    }

    // Otherwise, run the provided middleware
    return middleware(request)
  }
}