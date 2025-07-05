import type { PostgrestError } from '@supabase/supabase-js';

export interface ErrorDetails {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
  hint?: string;
}

/**
 * Custom error class for Supabase operations
 */
export class SupabaseError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;
  hint?: string;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'SupabaseError';
    this.code = details.code;
    this.statusCode = details.statusCode;
    this.details = details.details;
    this.hint = details.hint;
  }
}

/**
 * Convert Postgrest error to custom error
 */
export function handlePostgrestError(error: PostgrestError): SupabaseError {
  let message = error.message;
  let statusCode = 500;

  // Parse common error codes
  switch (error.code) {
    case '23505': // unique_violation
      message = 'A record with this value already exists';
      statusCode = 409;
      break;
    case '23503': // foreign_key_violation
      message = 'Referenced record does not exist';
      statusCode = 400;
      break;
    case '23502': // not_null_violation
      message = 'Required field is missing';
      statusCode = 400;
      break;
    case '22P02': // invalid_text_representation
      message = 'Invalid data format';
      statusCode = 400;
      break;
    case '42501': // insufficient_privilege
      message = 'Insufficient permissions';
      statusCode = 403;
      break;
    case '42P01': // undefined_table
      message = 'Table does not exist';
      statusCode = 500;
      break;
    case 'PGRST301': // JWT expired
      message = 'Session expired';
      statusCode = 401;
      break;
  }

  return new SupabaseError({
    message,
    code: error.code,
    statusCode,
    details: error.details,
    hint: error.hint,
  });
}

/**
 * Handle authentication errors
 */
export function handleAuthError(error: any): SupabaseError {
  let message = error.message || 'Authentication error';
  let statusCode = 401;

  if (error.message?.includes('Invalid login credentials')) {
    message = 'Invalid email or password';
  } else if (error.message?.includes('Email not confirmed')) {
    message = 'Please verify your email before signing in';
    statusCode = 403;
  } else if (error.message?.includes('User already registered')) {
    message = 'An account with this email already exists';
    statusCode = 409;
  }

  return new SupabaseError({
    message,
    code: error.code || 'AUTH_ERROR',
    statusCode,
  });
}

/**
 * Handle storage errors
 */
export function handleStorageError(error: any): SupabaseError {
  let message = error.message || 'Storage error';
  let statusCode = 500;

  if (error.message?.includes('not found')) {
    message = 'File not found';
    statusCode = 404;
  } else if (error.message?.includes('exceeded')) {
    message = 'File size limit exceeded';
    statusCode = 413;
  } else if (error.message?.includes('unauthorized')) {
    message = 'Unauthorized to access this file';
    statusCode = 403;
  }

  return new SupabaseError({
    message,
    code: error.code || 'STORAGE_ERROR',
    statusCode,
  });
}

/**
 * Generic error handler
 */
export function handleError(error: any): SupabaseError {
  if (error instanceof SupabaseError) {
    return error;
  }

  if (error.code && error.message && error.details !== undefined) {
    return handlePostgrestError(error);
  }

  if (error.message?.toLowerCase().includes('auth')) {
    return handleAuthError(error);
  }

  if (error.message?.toLowerCase().includes('storage')) {
    return handleStorageError(error);
  }

  return new SupabaseError({
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    statusCode: error.statusCode || 500,
  });
}

/**
 * Error boundary for async operations
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const supabaseError = handleError(error);
    if (errorMessage) {
      supabaseError.message = `${errorMessage}: ${supabaseError.message}`;
    }
    throw supabaseError;
  }
}