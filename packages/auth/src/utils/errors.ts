import type { AuthError } from '../types'

/**
 * Custom error class for authentication errors
 */
export class AuthenticationError extends Error {
  public code: string
  public status: number

  constructor(
    message: string,
    code: string = 'AUTH_ERROR',
    status: number = 401
  ) {
    super(message)
    this.name = 'AuthenticationError'
    this.code = code
    this.status = status
  }
}

/**
 * Common authentication error types
 */
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: new AuthenticationError(
    'Invalid email or password',
    'INVALID_CREDENTIALS'
  ),
  USER_NOT_FOUND: new AuthenticationError(
    'User not found',
    'USER_NOT_FOUND',
    404
  ),
  EMAIL_NOT_VERIFIED: new AuthenticationError(
    'Email not verified',
    'EMAIL_NOT_VERIFIED',
    403
  ),
  ACCOUNT_DISABLED: new AuthenticationError(
    'Account has been disabled',
    'ACCOUNT_DISABLED',
    403
  ),
  INVALID_TOKEN: new AuthenticationError(
    'Invalid or expired token',
    'INVALID_TOKEN'
  ),
  SESSION_EXPIRED: new AuthenticationError(
    'Session has expired',
    'SESSION_EXPIRED'
  ),
  INSUFFICIENT_PERMISSIONS: new AuthenticationError(
    'Insufficient permissions',
    'INSUFFICIENT_PERMISSIONS',
    403
  ),
  ORGANIZATION_REQUIRED: new AuthenticationError(
    'Organization membership required',
    'ORGANIZATION_REQUIRED',
    403
  ),
  RATE_LIMIT_EXCEEDED: new AuthenticationError(
    'Too many attempts, please try again later',
    'RATE_LIMIT_EXCEEDED',
    429
  ),
  NETWORK_ERROR: new AuthenticationError(
    'Network error, please try again',
    'NETWORK_ERROR',
    500
  ),
}

/**
 * Map Supabase auth errors to user-friendly messages
 */
export function mapAuthError(error: any): AuthError {
  const message =
    error.message || error.error_description || 'An unexpected error occurred'
  const code = error.code || error.error || 'UNKNOWN_ERROR'

  // Map common Supabase error codes
  const errorMap: Record<string, string> = {
    invalid_grant: 'Invalid email or password',
    user_not_found: 'No account found with this email',
    email_not_confirmed: 'Please verify your email before signing in',
    invalid_password: 'Incorrect password',
    user_already_exists: 'An account with this email already exists',
    password_too_short: 'Password must be at least 8 characters',
    weak_password: 'Password is too weak, please use a stronger password',
    rate_limit_exceeded: 'Too many attempts, please try again later',
    invalid_token: 'Invalid or expired token',
    session_not_found: 'Session has expired, please sign in again',
  }

  const friendlyMessage = errorMap[code] || message

  return {
    message: friendlyMessage,
    code,
    status: error.status,
  }
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AuthenticationError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }

    if ('error' in error && typeof error.error === 'string') {
      return error.error
    }
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch')
    )
  }
  return false
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: unknown): AuthError {
  if (isAuthError(error)) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
    }
  }

  return {
    message: getErrorMessage(error),
    code: 'UNKNOWN_ERROR',
    status: 500,
  }
}
