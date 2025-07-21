import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TenantRateLimiter, withRateLimit } from '../../../middleware/rate-limiter'
import { NextRequest, NextResponse } from 'next/server'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis()
  })),
  rpc: vi.fn()
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

describe('TenantRateLimiter', () => {
  let rateLimiter: TenantRateLimiter
  const mockContext = {
    organizationId: 'org-123',
    userId: 'user-456',
    role: 'admin' as const,
    permissions: ['*']
  }

  beforeEach(() => {
    vi.clearAllMocks()
    rateLimiter = TenantRateLimiter.getInstance()
    // Clear the cache between tests
    rateLimiter.cleanup()
  })

  describe('Rate Limit Checking', () => {
    it('should allow requests within limit', async () => {
      const config = {
        windowMs: 60000, // 1 minute
        maxRequests: 10
      }

      const result = await rateLimiter.checkRateLimit('test-key', config, mockContext)

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(9)
      expect(result.totalHits).toBe(1)
    })

    it('should block requests exceeding limit', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 2
      }

      // Make requests up to limit
      await rateLimiter.checkRateLimit('test-key', config, mockContext)
      await rateLimiter.checkRateLimit('test-key', config, mockContext)
      
      // This should be blocked
      const result = await rateLimiter.checkRateLimit('test-key', config, mockContext)

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.totalHits).toBe(2)
    })

    it('should reset counter after time window', async () => {
      const config = {
        windowMs: 100, // Very short window
        maxRequests: 1
      }

      // First request should succeed
      const result1 = await rateLimiter.checkRateLimit('test-key', config, mockContext)
      expect(result1.success).toBe(true)

      // Second request should be blocked
      const result2 = await rateLimiter.checkRateLimit('test-key', config, mockContext)
      expect(result2.success).toBe(false)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Third request should succeed (new window)
      const result3 = await rateLimiter.checkRateLimit('test-key', config, mockContext)
      expect(result3.success).toBe(true)
      expect(result3.totalHits).toBe(1) // Reset counter
    })

    it('should handle multiple keys independently', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 2
      }

      // Use different keys
      const result1 = await rateLimiter.checkRateLimit('key-1', config, mockContext)
      const result2 = await rateLimiter.checkRateLimit('key-2', config, mockContext)

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result1.totalHits).toBe(1)
      expect(result2.totalHits).toBe(1)
    })

    it('should provide accurate reset time', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 1
      }

      const startTime = Date.now()
      const result = await rateLimiter.checkRateLimit('test-key', config, mockContext)

      expect(result.resetTime).toBeGreaterThan(startTime)
      expect(result.resetTime).toBeLessThanOrEqual(startTime + config.windowMs)
    })
  })

  describe('Organization-specific Rate Limits', () => {
    it('should fetch organization rate limits from database', async () => {
      const mockLimits = [
        {
          endpoint: 'api/workspaces',
          window_ms: 900000,
          max_requests: 50,
          enabled: true
        }
      ]

      mockSupabase.from().eq().eq().mockResolvedValue({
        data: mockLimits,
        error: null
      })

      const limits = await rateLimiter.getOrgRateLimits('org-123')

      expect(limits['api/workspaces']).toEqual({
        windowMs: 900000,
        maxRequests: 50,
        message: 'Rate limit exceeded for api/workspaces',
        headers: true
      })
    })

    it('should fall back to defaults on database error', async () => {
      mockSupabase.from().eq().eq().mockResolvedValue({
        data: null,
        error: new Error('Database error')
      })

      const limits = await rateLimiter.getOrgRateLimits('org-123')

      expect(limits.global).toBeDefined()
      expect(limits['api/workspaces']).toBeDefined()
    })

    it('should merge custom limits with defaults', async () => {
      const mockCustomLimits = [
        {
          endpoint: 'api/workspaces',
          window_ms: 300000, // Custom limit
          max_requests: 25,
          enabled: true
        }
      ]

      mockSupabase.from().eq().eq().mockResolvedValue({
        data: mockCustomLimits,
        error: null
      })

      const limits = await rateLimiter.getOrgRateLimits('org-123')

      // Should have custom limit
      expect(limits['api/workspaces'].maxRequests).toBe(25)
      // Should have default limits for other endpoints
      expect(limits['api/billing']).toBeDefined()
    })
  })

  describe('Usage Metrics', () => {
    it('should update usage metrics after successful requests', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      await rateLimiter.updateUsageMetrics('org-123', 'api/workspaces')

      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_usage_quota', {
        p_organization_id: 'org-123',
        p_resource_type: 'workspace_api_calls',
        p_increment_by: 1
      })
    })

    it('should map endpoints to correct resource types', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      await rateLimiter.updateUsageMetrics('org-123', 'api/billing')

      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_usage_quota', {
        p_organization_id: 'org-123',
        p_resource_type: 'billing_api_calls',
        p_increment_by: 1
      })
    })

    it('should not throw on usage tracking errors', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Database error'))

      await expect(
        rateLimiter.updateUsageMetrics('org-123', 'api/workspaces')
      ).resolves.not.toThrow()
    })
  })

  describe('Cache Management', () => {
    it('should clean up expired entries', async () => {
      const config = {
        windowMs: 100,
        maxRequests: 5
      }

      // Add some entries
      await rateLimiter.checkRateLimit('key-1', config, mockContext)
      await rateLimiter.checkRateLimit('key-2', config, mockContext)

      expect(rateLimiter.getCacheSize()).toBe(2)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))

      // Cleanup should remove expired entries
      rateLimiter.cleanup()
      expect(rateLimiter.getCacheSize()).toBe(0)
    })

    it('should maintain active entries during cleanup', async () => {
      const config = {
        windowMs: 60000, // Long window
        maxRequests: 5
      }

      await rateLimiter.checkRateLimit('active-key', config, mockContext)
      
      // Add an expired entry manually (simulate)
      const expiredConfig = { windowMs: 1, maxRequests: 1 }
      await rateLimiter.checkRateLimit('expired-key', expiredConfig, mockContext)
      
      await new Promise(resolve => setTimeout(resolve, 50))
      
      rateLimiter.cleanup()

      // Active entry should remain
      const result = await rateLimiter.checkRateLimit('active-key', config, mockContext)
      expect(result.totalHits).toBe(2) // Should continue from previous count
    })
  })
})

describe('withRateLimit Middleware', () => {
  const mockHandler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }))
  const mockContext = {
    organizationId: 'org-123',
    userId: 'user-456',
    role: 'admin' as const,
    permissions: ['*']
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset rate limiter instance
    TenantRateLimiter.getInstance().cleanup()
  })

  describe('Middleware Integration', () => {
    it('should apply rate limiting to handlers', async () => {
      const limitedHandler = withRateLimit('api/test', { maxRequests: 1, windowMs: 60000 })(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      // First request should succeed
      const response1 = await limitedHandler(request, mockContext)
      expect(response1.status).toBe(200)
      expect(mockHandler).toHaveBeenCalledTimes(1)

      // Second request should be rate limited
      const response2 = await limitedHandler(request, mockContext)
      expect(response2.status).toBe(429)
      expect(mockHandler).toHaveBeenCalledTimes(1) // Should not call handler again
    })

    it('should add rate limit headers to successful responses', async () => {
      const limitedHandler = withRateLimit('api/test', { maxRequests: 10, windowMs: 60000 })(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      const response = await limitedHandler(request, mockContext)

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9')
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined()
    })

    it('should add rate limit headers to error responses', async () => {
      const limitedHandler = withRateLimit('api/test', { maxRequests: 1, windowMs: 60000 })(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      // First request
      await limitedHandler(request, mockContext)
      
      // Second request (rate limited)
      const response = await limitedHandler(request, mockContext)

      expect(response.headers.get('X-RateLimit-Limit')).toBe('1')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(response.headers.get('Retry-After')).toBeDefined()
    })

    it('should generate proper rate limit keys', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 127.0.0.1',
          'x-real-ip': '192.168.1.1'
        }
      })

      const limitedHandler = withRateLimit('api/test', { maxRequests: 10 })(mockHandler)
      await limitedHandler(request, mockContext)

      // Should use org:user:endpoint:ip format
      // Verify by checking that subsequent requests with same context are limited together
      expect(mockHandler).toHaveBeenCalledTimes(1)
    })

    it('should handle custom key generators', async () => {
      const customKeyGen = (req: NextRequest, context: any) => `custom:${context.organizationId}`
      
      const limitedHandler = withRateLimit('api/test', { 
        maxRequests: 1, 
        keyGenerator: customKeyGen 
      })(mockHandler)
      
      const request1 = new NextRequest('http://localhost/api/test')
      const request2 = new NextRequest('http://localhost/api/different')

      // Both requests should share the same limit (same custom key)
      await limitedHandler(request1, mockContext)
      const response2 = await limitedHandler(request2, mockContext)

      expect(response2.status).toBe(429) // Should be rate limited
    })

    it('should log rate limit violations to audit log', async () => {
      mockSupabase.from().insert.mockResolvedValue({ error: null })

      const limitedHandler = withRateLimit('api/test', { maxRequests: 1 })(mockHandler)
      const request = new NextRequest('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Test Browser'
        }
      })

      // Exceed rate limit
      await limitedHandler(request, mockContext)
      await limitedHandler(request, mockContext)

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_id: mockContext.organizationId,
          action: 'rate_limit_exceeded',
          result: 'failure'
        })
      )
    })
  })

  describe('Organization-specific Limits', () => {
    it('should use organization-specific rate limits', async () => {
      const orgLimits = {
        'api/test': {
          windowMs: 60000,
          maxRequests: 2,
          message: 'Custom limit exceeded'
        }
      }

      vi.spyOn(TenantRateLimiter.prototype, 'getOrgRateLimits').mockResolvedValue(orgLimits)

      const limitedHandler = withRateLimit('api/test')(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      // Should use org-specific limit of 2
      await limitedHandler(request, mockContext)
      await limitedHandler(request, mockContext)
      const response = await limitedHandler(request, mockContext)

      expect(response.status).toBe(429)
      const body = await response.json()
      expect(body.message).toBe('Custom limit exceeded')
    })

    it('should fall back to global limits when endpoint not configured', async () => {
      const orgLimits = {
        'api/other': { windowMs: 60000, maxRequests: 5 },
        global: { windowMs: 60000, maxRequests: 100 }
      }

      vi.spyOn(TenantRateLimiter.prototype, 'getOrgRateLimits').mockResolvedValue(orgLimits)

      const limitedHandler = withRateLimit('api/test')(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      const response = await limitedHandler(request, mockContext)
      
      // Should use global limit
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100')
    })
  })

  describe('Error Handling', () => {
    it('should handle rate limiter errors gracefully', async () => {
      vi.spyOn(TenantRateLimiter.prototype, 'checkRateLimit').mockRejectedValue(new Error('Redis error'))

      const limitedHandler = withRateLimit('api/test', { skipOnError: true })(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      const response = await limitedHandler(request, mockContext)

      // Should continue to handler despite error
      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })

    it('should return 503 when rate limiter fails and skipOnError is false', async () => {
      vi.spyOn(TenantRateLimiter.prototype, 'checkRateLimit').mockRejectedValue(new Error('Database error'))

      const limitedHandler = withRateLimit('api/test', { skipOnError: false })(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      const response = await limitedHandler(request, mockContext)

      expect(response.status).toBe(503)
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should handle org limit fetch errors', async () => {
      vi.spyOn(TenantRateLimiter.prototype, 'getOrgRateLimits').mockRejectedValue(new Error('DB error'))

      const limitedHandler = withRateLimit('api/test')(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      // Should fall back to default limits
      const response = await limitedHandler(request, mockContext)
      expect(response.status).toBe(200)
    })
  })

  describe('Response Format', () => {
    it('should return proper error response format', async () => {
      const limitedHandler = withRateLimit('api/test', { 
        maxRequests: 1,
        message: 'Custom message'
      })(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      // Exceed limit
      await limitedHandler(request, mockContext)
      const response = await limitedHandler(request, mockContext)

      expect(response.status).toBe(429)
      
      const body = await response.json()
      expect(body).toEqual({
        error: 'Rate limit exceeded',
        message: 'Custom message',
        retryAfter: expect.any(Number)
      })
    })

    it('should include retry after header', async () => {
      const limitedHandler = withRateLimit('api/test', { maxRequests: 1, windowMs: 60000 })(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      await limitedHandler(request, mockContext)
      const response = await limitedHandler(request, mockContext)

      const retryAfter = response.headers.get('Retry-After')
      expect(retryAfter).toBeDefined()
      expect(parseInt(retryAfter!)).toBeGreaterThan(0)
      expect(parseInt(retryAfter!)).toBeLessThanOrEqual(60)
    })
  })
})