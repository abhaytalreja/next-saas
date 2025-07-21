import { NextRequest, NextResponse } from 'next/server'
import type { TenantContext } from './tenant-context'

export interface SecurityConfig {
  contentSecurityPolicy?: string | boolean
  frameOptions?: 'DENY' | 'SAMEORIGIN' | false
  contentTypeOptions?: boolean
  referrerPolicy?: string
  strictTransportSecurity?: string | boolean
  permissionsPolicy?: string
  crossOriginEmbedderPolicy?: boolean
  crossOriginOpenerPolicy?: boolean
  crossOriginResourcePolicy?: 'same-site' | 'same-origin' | 'cross-origin'
}

/**
 * Default security configuration
 */
const DEFAULT_SECURITY_CONFIG: Required<SecurityConfig> = {
  contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' wss: https:",
  frameOptions: 'DENY',
  contentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
  permissionsPolicy: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: 'same-origin'
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse, 
  config: SecurityConfig = {}
): NextResponse {
  const finalConfig = { ...DEFAULT_SECURITY_CONFIG, ...config }

  // Content Security Policy
  if (finalConfig.contentSecurityPolicy) {
    const cspValue = typeof finalConfig.contentSecurityPolicy === 'string' 
      ? finalConfig.contentSecurityPolicy 
      : DEFAULT_SECURITY_CONFIG.contentSecurityPolicy
    response.headers.set('Content-Security-Policy', cspValue)
  }

  // Frame Options
  if (finalConfig.frameOptions) {
    response.headers.set('X-Frame-Options', finalConfig.frameOptions)
  }

  // Content Type Options
  if (finalConfig.contentTypeOptions) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }

  // Referrer Policy
  if (finalConfig.referrerPolicy) {
    response.headers.set('Referrer-Policy', finalConfig.referrerPolicy)
  }

  // Strict Transport Security
  if (finalConfig.strictTransportSecurity) {
    const hstsValue = typeof finalConfig.strictTransportSecurity === 'string'
      ? finalConfig.strictTransportSecurity
      : DEFAULT_SECURITY_CONFIG.strictTransportSecurity
    response.headers.set('Strict-Transport-Security', hstsValue)
  }

  // Permissions Policy
  if (finalConfig.permissionsPolicy) {
    response.headers.set('Permissions-Policy', finalConfig.permissionsPolicy)
  }

  // Cross-Origin Embedder Policy
  if (finalConfig.crossOriginEmbedderPolicy) {
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  }

  // Cross-Origin Opener Policy
  if (finalConfig.crossOriginOpenerPolicy) {
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  }

  // Cross-Origin Resource Policy
  if (finalConfig.crossOriginResourcePolicy) {
    response.headers.set('Cross-Origin-Resource-Policy', finalConfig.crossOriginResourcePolicy)
  }

  // Additional security headers
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  return response
}

/**
 * Security middleware factory
 */
export function withSecurity(config?: SecurityConfig) {
  return function(
    handler: (req: NextRequest, context?: TenantContext) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context?: TenantContext) => {
      // Execute the handler
      const response = await handler(req, context)
      
      // Apply security headers
      return applySecurityHeaders(response, config)
    }
  }
}

/**
 * Tenant-specific security configuration
 */
export interface TenantSecurityConfig extends SecurityConfig {
  allowedDomains?: string[]
  apiKeyRequired?: boolean
  ipWhitelist?: string[]
  maxPayloadSize?: number
}

/**
 * Enhanced security middleware with tenant-specific rules
 */
export function withTenantSecurity(
  getTenantConfig?: (context: TenantContext) => Promise<TenantSecurityConfig>
) {
  return function(
    handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context: TenantContext) => {
      try {
        // Get tenant-specific security config
        const tenantConfig = getTenantConfig ? await getTenantConfig(context) : {}
        
        // Validate IP whitelist if configured
        if (tenantConfig.ipWhitelist && tenantConfig.ipWhitelist.length > 0) {
          const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                          req.headers.get('x-real-ip') || 
                          req.ip
          
          if (clientIP && !tenantConfig.ipWhitelist.includes(clientIP)) {
            return NextResponse.json(
              { error: 'IP address not allowed' },
              { status: 403 }
            )
          }
        }
        
        // Validate allowed domains for CORS
        if (tenantConfig.allowedDomains && tenantConfig.allowedDomains.length > 0) {
          const origin = req.headers.get('origin')
          if (origin && !tenantConfig.allowedDomains.includes(origin)) {
            return NextResponse.json(
              { error: 'Domain not allowed' },
              { status: 403 }
            )
          }
        }
        
        // Check payload size limits
        if (tenantConfig.maxPayloadSize) {
          const contentLength = req.headers.get('content-length')
          if (contentLength && parseInt(contentLength) > tenantConfig.maxPayloadSize) {
            return NextResponse.json(
              { error: 'Payload too large' },
              { status: 413 }
            )
          }
        }
        
        // Execute handler
        const response = await handler(req, context)
        
        // Build CSP with tenant-allowed domains
        let cspPolicy = DEFAULT_SECURITY_CONFIG.contentSecurityPolicy
        if (tenantConfig.allowedDomains && tenantConfig.allowedDomains.length > 0) {
          const allowedOrigins = tenantConfig.allowedDomains.join(' ')
          cspPolicy = cspPolicy.replace(
            "connect-src 'self'", 
            `connect-src 'self' ${allowedOrigins}`
          )
        }
        
        // Apply security headers with tenant config
        return applySecurityHeaders(response, {
          ...tenantConfig,
          contentSecurityPolicy: cspPolicy
        })
      } catch (error) {
        console.error('Tenant security middleware error:', error)
        return NextResponse.json(
          { error: 'Security validation failed' },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * Input validation and sanitization
 */
export interface ValidationRule {
  field: string
  required?: boolean
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  sanitize?: boolean
  allowedValues?: string[]
}

export function sanitizeInput(input: any, rules: ValidationRule[]): { 
  sanitized: any, 
  errors: string[] 
} {
  const sanitized: any = {}
  const errors: string[] = []
  
  for (const rule of rules) {
    const value = input[rule.field]
    
    // Required field check
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field} is required`)
      continue
    }
    
    // Skip further validation if field is optional and empty
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue
    }
    
    let processedValue = value
    
    // Sanitization
    if (rule.sanitize && typeof value === 'string') {
      processedValue = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=\s*["\'][^"\']*["\']?/gi, '') // Remove event handlers
        .trim()
    }
    
    // Length validation
    if (typeof processedValue === 'string') {
      if (rule.maxLength && processedValue.length > rule.maxLength) {
        errors.push(`${rule.field} exceeds maximum length of ${rule.maxLength}`)
        continue
      }
      
      if (rule.minLength && processedValue.length < rule.minLength) {
        errors.push(`${rule.field} is shorter than minimum length of ${rule.minLength}`)
        continue
      }
    }
    
    // Pattern validation
    if (rule.pattern && typeof processedValue === 'string') {
      if (!rule.pattern.test(processedValue)) {
        errors.push(`${rule.field} format is invalid`)
        continue
      }
    }
    
    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(processedValue)) {
      errors.push(`${rule.field} must be one of: ${rule.allowedValues.join(', ')}`)
      continue
    }
    
    sanitized[rule.field] = processedValue
  }
  
  return { sanitized, errors }
}

/**
 * Input validation middleware
 */
export function withInputValidation(rules: ValidationRule[]) {
  return function(
    handler: (req: NextRequest, context?: TenantContext) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context?: TenantContext) => {
      try {
        // Only validate for requests with body content
        if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
          return handler(req, context)
        }
        
        const body = await req.json().catch(() => ({}))
        const { sanitized, errors } = sanitizeInput(body, rules)
        
        if (errors.length > 0) {
          return NextResponse.json(
            { 
              error: 'Validation failed', 
              details: errors 
            },
            { status: 400 }
          )
        }
        
        // Create new request with sanitized body
        const sanitizedRequest = new NextRequest(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(sanitized)
        })
        
        return handler(sanitizedRequest, context)
      } catch (error) {
        console.error('Input validation error:', error)
        return NextResponse.json(
          { error: 'Invalid request format' },
          { status: 400 }
        )
      }
    }
  }
}

/**
 * CSRF protection middleware
 */
export function withCSRFProtection() {
  return function(
    handler: (req: NextRequest, context?: TenantContext) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context?: TenantContext) => {
      // Skip CSRF for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return handler(req, context)
      }
      
      const csrfToken = req.headers.get('x-csrf-token')
      const cookieToken = req.cookies.get('csrf-token')?.value
      
      // Validate CSRF token
      if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
      
      return handler(req, context)
    }
  }
}

/**
 * Request size limit middleware
 */
export function withRequestSizeLimit(maxSizeBytes: number = 1024 * 1024) { // Default 1MB
  return function(
    handler: (req: NextRequest, context?: TenantContext) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context?: TenantContext) => {
      const contentLength = req.headers.get('content-length')
      
      if (contentLength && parseInt(contentLength) > maxSizeBytes) {
        return NextResponse.json(
          { 
            error: 'Request too large',
            maxSize: `${Math.round(maxSizeBytes / 1024)}KB`
          },
          { status: 413 }
        )
      }
      
      return handler(req, context)
    }
  }
}