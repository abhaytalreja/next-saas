import { NextRequest, NextResponse } from 'next/server'

interface SecurityHeadersConfig {
  contentSecurityPolicy?: string
  strictTransportSecurity?: string
  xFrameOptions?: string
  xContentTypeOptions?: string
  referrerPolicy?: string
  permissionsPolicy?: string
}

const defaultConfig: SecurityHeadersConfig = {
  contentSecurityPolicy:
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.supabase.io https://*.supabase.co wss://*.supabase.co",
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=(), payment=()',
}

/**
 * Security headers middleware
 * Adds security headers to protect against common attacks
 */
export function securityHeaders(config: SecurityHeadersConfig = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Apply security headers
    if (finalConfig.contentSecurityPolicy) {
      response.headers.set(
        'Content-Security-Policy',
        finalConfig.contentSecurityPolicy
      )
    }

    if (
      finalConfig.strictTransportSecurity &&
      request.nextUrl.protocol === 'https:'
    ) {
      response.headers.set(
        'Strict-Transport-Security',
        finalConfig.strictTransportSecurity
      )
    }

    if (finalConfig.xFrameOptions) {
      response.headers.set('X-Frame-Options', finalConfig.xFrameOptions)
    }

    if (finalConfig.xContentTypeOptions) {
      response.headers.set(
        'X-Content-Type-Options',
        finalConfig.xContentTypeOptions
      )
    }

    if (finalConfig.referrerPolicy) {
      response.headers.set('Referrer-Policy', finalConfig.referrerPolicy)
    }

    if (finalConfig.permissionsPolicy) {
      response.headers.set('Permissions-Policy', finalConfig.permissionsPolicy)
    }

    return response
  }
}
