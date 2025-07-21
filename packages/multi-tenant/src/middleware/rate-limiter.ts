import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { TenantContext } from './tenant-context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest, context: TenantContext) => string
  skipOnError?: boolean
  message?: string
  headers?: boolean
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

/**
 * Advanced rate limiter with tenant-aware quotas and Redis-like functionality
 */
export class TenantRateLimiter {
  private static instance: TenantRateLimiter
  private cache: Map<string, { count: number; resetTime: number }> = new Map()
  
  static getInstance(): TenantRateLimiter {
    if (!TenantRateLimiter.instance) {
      TenantRateLimiter.instance = new TenantRateLimiter()
    }
    return TenantRateLimiter.instance
  }

  /**
   * Check rate limit for a specific key
   */
  async checkRateLimit(
    key: string, 
    config: RateLimitConfig,
    context: TenantContext
  ): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Get current usage from cache or initialize
    const current = this.cache.get(key)
    const resetTime = current?.resetTime || (now + config.windowMs)
    
    // Reset if window has passed
    if (!current || now > current.resetTime) {
      this.cache.set(key, { count: 1, resetTime })
      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetTime,
        totalHits: 1
      }
    }
    
    // Check if limit exceeded
    if (current.count >= config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime,
        totalHits: current.count
      }
    }
    
    // Increment counter
    current.count++
    this.cache.set(key, current)
    
    return {
      success: true,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime,
      totalHits: current.count
    }
  }

  /**
   * Get organization-specific rate limits from database
   */
  async getOrgRateLimits(organizationId: string): Promise<Record<string, RateLimitConfig>> {
    try {
      const { data: limits, error } = await supabase
        .from('rate_limits')
        .select('endpoint, window_ms, max_requests, enabled')
        .eq('organization_id', organizationId)
        .eq('enabled', true)

      if (error) {
        console.error('Failed to fetch org rate limits:', error)
        return this.getDefaultLimits()
      }

      const configs: Record<string, RateLimitConfig> = {}
      
      limits?.forEach(limit => {
        configs[limit.endpoint] = {
          windowMs: limit.window_ms,
          maxRequests: limit.max_requests,
          message: `Rate limit exceeded for ${limit.endpoint}`,
          headers: true
        }
      })

      // Fill in defaults for missing endpoints
      const defaults = this.getDefaultLimits()
      return { ...defaults, ...configs }
    } catch (error) {
      console.error('Error fetching rate limits:', error)
      return this.getDefaultLimits()
    }
  }

  /**
   * Default rate limits for different endpoint types
   */
  private getDefaultLimits(): Record<string, RateLimitConfig> {
    return {
      'api/workspaces': {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        message: 'Too many workspace requests'
      },
      'api/projects': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 200,
        message: 'Too many project requests'
      },
      'api/billing': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10,
        message: 'Too many billing requests'
      },
      'api/audit': {
        windowMs: 60 * 60 * 1000,
        maxRequests: 50,
        message: 'Too many audit requests'
      },
      'api/members': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 50,
        message: 'Too many member management requests'
      },
      'api/auth': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 20,
        message: 'Too many authentication requests'
      },
      'global': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 500,
        message: 'Rate limit exceeded'
      }
    }
  }

  /**
   * Clean expired entries from cache
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now > value.resetTime) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get current cache size (for monitoring)
   */
  getCacheSize(): number {
    return this.cache.size
  }
}

/**
 * Generate rate limit key based on request and context
 */
function generateRateLimitKey(
  req: NextRequest, 
  context: TenantContext, 
  endpoint: string,
  customKeyGen?: (req: NextRequest, context: TenantContext) => string
): string {
  if (customKeyGen) {
    return customKeyGen(req, context)
  }

  // Default key: org_id:user_id:endpoint:ip
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
           req.headers.get('x-real-ip') || 
           'unknown'
  
  return `${context.organizationId}:${context.userId}:${endpoint}:${ip}`
}

/**
 * Middleware factory for rate limiting
 */
export function withRateLimit(
  endpoint: string,
  customConfig?: Partial<RateLimitConfig>
) {
  return function(
    handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context: TenantContext) => {
      const rateLimiter = TenantRateLimiter.getInstance()
      
      try {
        // Get organization-specific limits
        const orgLimits = await rateLimiter.getOrgRateLimits(context.organizationId)
        const config = { ...orgLimits[endpoint] || orgLimits.global, ...customConfig }
        
        // Generate rate limit key
        const key = generateRateLimitKey(req, context, endpoint, config.keyGenerator)
        
        // Check rate limit
        const result = await rateLimiter.checkRateLimit(key, config, context)
        
        if (!result.success) {
          // Log rate limit violation
          await supabase
            .from('audit_logs')
            .insert({
              organization_id: context.organizationId,
              actor_id: context.userId,
              actor_type: 'user',
              action: 'rate_limit_exceeded',
              resource_type: 'api',
              resource_id: endpoint,
              result: 'failure',
              error_message: config.message,
              ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || 
                          req.headers.get('x-real-ip'),
              user_agent: req.headers.get('user-agent'),
              metadata: {
                endpoint,
                total_hits: result.totalHits,
                window_ms: config.windowMs,
                max_requests: config.maxRequests
              }
            })
        
          const response = NextResponse.json(
            { 
              error: 'Rate limit exceeded',
              message: config.message,
              retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
            },
            { status: 429 }
          )
          
          if (config.headers) {
            response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
            response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
            response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
            response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString())
          }
          
          return response
        }
        
        // Update usage quotas for billing/analytics
        await rateLimiter.updateUsageMetrics(context.organizationId, endpoint)
        
        // Continue to handler
        const response = await handler(req, context)
        
        // Add rate limit headers to successful responses
        if (config.headers) {
          response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
          response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
          response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
        }
        
        return response
      } catch (error) {
        console.error('Rate limiting error:', error)
        
        // Skip rate limiting on error if configured
        if (customConfig?.skipOnError) {
          return handler(req, context)
        }
        
        return NextResponse.json(
          { error: 'Rate limiting service unavailable' },
          { status: 503 }
        )
      }
    }
  }
}

/**
 * Extension to TenantRateLimiter for usage tracking
 */
declare module './rate-limiter' {
  namespace TenantRateLimiter {
    interface TenantRateLimiter {
      updateUsageMetrics(organizationId: string, endpoint: string): Promise<void>
    }
  }
}

TenantRateLimiter.prototype.updateUsageMetrics = async function(
  organizationId: string, 
  endpoint: string
): Promise<void> {
  try {
    // Update API usage metrics for billing
    const resourceType = endpoint.includes('billing') ? 'billing_api_calls' : 
                        endpoint.includes('audit') ? 'audit_api_calls' :
                        endpoint.includes('workspace') ? 'workspace_api_calls' :
                        endpoint.includes('project') ? 'project_api_calls' : 
                        'api_calls'

    await supabase
      .rpc('increment_usage_quota', {
        p_organization_id: organizationId,
        p_resource_type: resourceType,
        p_increment_by: 1
      })
  } catch (error) {
    // Don't block requests if usage tracking fails
    console.error('Failed to update usage metrics:', error)
  }
}

/**
 * Global rate limiter for non-tenant-specific endpoints
 */
export function withGlobalRateLimit(config: RateLimitConfig) {
  return function(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async (req: NextRequest) => {
      const rateLimiter = TenantRateLimiter.getInstance()
      
      // Use IP-based key for global limits
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                req.headers.get('x-real-ip') || 
                'unknown'
      const key = `global:${ip}`
      
      const mockContext: TenantContext = {
        organizationId: 'global',
        userId: 'global',
        role: 'anonymous',
        permissions: []
      }
      
      const result = await rateLimiter.checkRateLimit(key, config, mockContext)
      
      if (!result.success) {
        const response = NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: config.message || 'Too many requests',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          },
          { status: 429 }
        )
        
        response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', '0')
        response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
        response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString())
        
        return response
      }
      
      const response = await handler(req)
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
      
      return response
    }
  }
}

/**
 * Cleanup task for rate limiter cache
 * Should be called periodically (e.g., via cron job)
 */
export function cleanupRateLimiter(): void {
  const rateLimiter = TenantRateLimiter.getInstance()
  rateLimiter.cleanup()
}