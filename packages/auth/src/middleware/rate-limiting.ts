import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
  keyGenerator?: (request: NextRequest) => string // Custom key generator
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (consider using Redis for production)
const store: RateLimitStore = {}

/**
 * Rate limiting middleware
 * Protects against brute force attacks and API abuse
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    keyGenerator = request => {
      // Default key generator uses IP + pathname
      const ip =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown'
      return `${ip}:${request.nextUrl.pathname}`
    },
  } = config

  return async function rateLimitMiddleware(request: NextRequest) {
    const key = keyGenerator(request)
    const now = Date.now()

    // Get or create rate limit entry
    let entry = store[key]

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      }
      store[key] = entry
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)

      return new NextResponse(JSON.stringify({ error: message }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
          'Retry-After': retryAfter.toString(),
        },
      })
    }

    // Increment counter
    entry.count++

    // Create response with rate limit headers
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set(
      'X-RateLimit-Remaining',
      (maxRequests - entry.count).toString()
    )
    response.headers.set(
      'X-RateLimit-Reset',
      new Date(entry.resetTime).toISOString()
    )

    return response
  }
}

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  }
}, 60000) // Clean up every minute

/**
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
  }),

  // General API rate limit
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'API rate limit exceeded.',
  }),

  // Password reset rate limit
  passwordReset: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 requests per hour
    message: 'Too many password reset requests, please try again later.',
  }),

  // Email verification rate limit
  emailVerification: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3, // 3 requests per 5 minutes
    message: 'Too many verification requests, please try again later.',
  }),
}

/**
 * Apply rate limiting to specific routes
 */
export function withRateLimit(
  middleware: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  rateLimiter: ReturnType<typeof createRateLimiter>
) {
  return async function enhancedMiddleware(request: NextRequest) {
    // Check rate limit first
    const rateLimitResponse = await rateLimiter(request)

    // If rate limit exceeded, return error response
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse
    }

    // Otherwise, run the provided middleware
    return middleware(request)
  }
}
