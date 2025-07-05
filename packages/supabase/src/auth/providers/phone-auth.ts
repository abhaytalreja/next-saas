import type { SupabaseClient } from '@supabase/supabase-js';
import { phoneAuthSchema } from '../validation';
import type { AuthResponse, PhoneCredentials, AuthSession } from '../types';
import type { Database } from '../../types/supabase';

/**
 * Sign in with phone number
 */
export async function signInWithPhone(
  supabase: SupabaseClient<Database>,
  credentials: PhoneCredentials
): Promise<AuthResponse<AuthSession>> {
  try {
    // Validate phone credentials
    const validatedData = phoneAuthSchema.parse(credentials);

    // If password is provided, sign in with phone and password
    if (validatedData.password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: validatedData.phone,
        password: validatedData.password,
      });

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            status: error.status,
            code: error.code,
          },
        };
      }

      return {
        data: data.session as AuthSession,
        error: null,
      };
    }

    // Otherwise, send OTP
    const { error } = await supabase.auth.signInWithOtp({
      phone: validatedData.phone,
      options: {
        channel: validatedData.channel,
      },
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
        },
      };
    }

    return {
      data: null,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Invalid phone number',
        status: 400,
      },
    };
  }
}

/**
 * Verify phone OTP
 */
export async function verifyPhoneOtp(
  supabase: SupabaseClient<Database>,
  phone: string,
  token: string
): Promise<AuthResponse<AuthSession>> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
        },
      };
    }

    return {
      data: data.session as AuthSession,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Invalid OTP',
        status: 400,
      },
    };
  }
}

/**
 * Resend phone OTP
 */
export async function resendPhoneOtp(
  supabase: SupabaseClient<Database>,
  phone: string,
  channel: 'sms' | 'whatsapp' = 'sms'
): Promise<AuthResponse<void>> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'sms',
      phone,
      options: {
        channel,
      },
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
        },
      };
    }

    return {
      data: null,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to resend OTP',
        status: 400,
      },
    };
  }
}

/**
 * Update phone number
 */
export async function updatePhoneNumber(
  supabase: SupabaseClient<Database>,
  phone: string
): Promise<AuthResponse<void>> {
  try {
    const { error } = await supabase.auth.updateUser({
      phone,
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
        },
      };
    }

    return {
      data: null,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to update phone number',
        status: 400,
      },
    };
  }
}