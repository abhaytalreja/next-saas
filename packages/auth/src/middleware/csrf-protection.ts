import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'

const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'csrf-token'
const CSRF_SECRET_COOKIE = 'csrf-secret'

/**
 * Generate a CSRF token
 */
function generateCSRFToken(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

/**
 * CSRF protection middleware
 * Protects against Cross-Site Request Forgery attacks
 */
export function csrfProtection() {
  return async function middleware(request: NextRequest) {
    const method = request.method

    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return NextResponse.next()
    }

    // Get or generate CSRF secret
    let csrfSecret = request.cookies.get(CSRF_SECRET_COOKIE)?.value

    if (!csrfSecret) {
      csrfSecret = randomBytes(32).toString('hex')
      const response = NextResponse.next()
      response.cookies.set(CSRF_SECRET_COOKIE, csrfSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      })

      // Generate and set CSRF token
      const csrfToken = generateCSRFToken(csrfSecret)
      response.cookies.set(CSRF_COOKIE, csrfToken, {
        httpOnly: false, // Accessible to JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      })

      return response
    }

    // Validate CSRF token
    const expectedToken = generateCSRFToken(csrfSecret)
    const actualToken =
      request.headers.get(CSRF_HEADER) ||
      request.cookies.get(CSRF_COOKIE)?.value

    if (actualToken !== expectedToken) {
      return new NextResponse('Invalid CSRF token', { status: 403 })
    }

    return NextResponse.next()
  }
}

/**
 * Get CSRF token for client-side use
 * Note: This function should only be imported in client components
 */
export function getCSRFToken(): string | null {
  if (typeof window === 'undefined') return null

  // Try to get from cookie
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === CSRF_COOKIE) {
      return value
    }
  }

  return null
}
