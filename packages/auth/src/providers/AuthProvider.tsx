'use client'

import { useRouter } from 'next/navigation'
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import { getSessionManager } from '../lib/session-manager'
import type {
  AuthContextValue,
  AuthError,
  AuthResponse,
  AuthSession,
  AuthUser,
  AuthUserProfile,
  MagicLinkCredentials,
  OAuthCredentials,
  PhoneCredentials,
  ResetPasswordCredentials,
  SignInCredentials,
  SignUpCredentials,
  UpdatePasswordCredentials,
  UpdateProfileData,
} from '../types'
import {
  magicLinkSchema,
  phoneSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  validateFormData,
} from '../utils/validation'

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const sessionManager = getSessionManager()
  const initializationRef = useRef(false)

  // Initialize authentication state
  useEffect(() => {
    if (initializationRef.current) return
    initializationRef.current = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (initialSession) {
          setSession(initialSession as AuthSession)
          setUser(initialSession.user as AuthUser)
        }
      } catch (error: any) {
        console.error('Error initializing auth:', error)
        setError({ message: error.message })
      } finally {
        setLoading(false)
      }
    }

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('Auth state changed:', event)

      setSession(session as AuthSession | null)
      setUser(session?.user as AuthUser | null)
      setLoading(false)
      setError(null)

      // Handle specific auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in:', session?.user?.email)
          router.refresh()
          break
        case 'SIGNED_OUT':
          console.log('User signed out')
          router.push('/')
          break
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed')
          break
        case 'USER_UPDATED':
          console.log('User updated')
          break
      }
    })

    initializeAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, sessionManager])

  // Sign in with email and password
  const signIn = useCallback(
    async (
      credentials: SignInCredentials
    ): Promise<AuthResponse<AuthSession>> => {
      setError(null)
      setLoading(true)

      try {
        // Validate credentials
        const validation = validateFormData(signInSchema, credentials)
        if (!validation.success) {
          const error = { message: Object.values(validation.errors!)[0] }
          setError(error)
          return { data: null, error }
        }

        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

        if (signInError) {
          // Check if this is an email confirmation error and email confirmation is disabled
          const disableEmailConfirmation = process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION === 'true'
          
          if (signInError.message?.includes('Email not confirmed') && disableEmailConfirmation) {
            // If email confirmation is disabled, ignore this error and try to proceed
            console.log('Email confirmation error ignored during sign-in due to DISABLE_EMAIL_CONFIRMATION flag')
            
            // For sign-in, we still want to return the session if it exists, even with email not confirmed
            if (data?.session) {
              return { data: data.session as AuthSession, error: null }
            }
            
            // If no session, return a more helpful error
            const error = { message: 'Sign-in failed. Please check your credentials.' }
            setError(error)
            return { data: null, error }
          }
          
          const error = { message: signInError.message }
          setError(error)
          return { data: null, error }
        }

        return { data: data.session as AuthSession, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to sign in' }
        setError(error)
        return { data: null, error }
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  // Sign up with email and password
  const signUp = useCallback(
    async (
      credentials: SignUpCredentials
    ): Promise<AuthResponse<AuthSession>> => {
      setError(null)
      setLoading(true)

      try {
        // Validate credentials
        const validation = validateFormData(signUpSchema, credentials)
        if (!validation.success) {
          const error = { message: Object.values(validation.errors!)[0] }
          setError(error)
          return { data: null, error }
        }

        // Use server-side signup API to bypass database trigger issues
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            organizationName: credentials.organizationName,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          const error = { message: result.error || 'Signup failed' }
          setError(error)
          return { data: null, error }
        }

        // Check if email confirmation is disabled
        const disableEmailConfirmation = process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION === 'true'
        
        if (disableEmailConfirmation) {
          // Skip automatic sign-in when email confirmation is disabled
          // Return success without session - user will need to manually sign in
          console.log('Signup successful with email confirmation disabled - user can now sign in manually')
          return { data: null, error: null }
        }

        // Now sign in the user to get a session (only when email confirmation is enabled)
        // Add small delay to ensure database consistency after user creation
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Retry sign-in up to 3 times with increasing delays
        let signInData = null
        let signInError = null
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })
          
          signInData = data
          signInError = error
          
          // If sign-in successful, break out of retry loop
          if (!error) {
            break
          }
          
          // If it's an email confirmation error and we have more attempts, wait and retry
          if (error.message?.includes('Email not confirmed') && attempt < 3) {
            console.log(`Sign-in attempt ${attempt} failed with email confirmation error, retrying...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
          
          // For other errors or final attempt, break out
          break
        }

        if (signInError) {
          // Check if this is an email confirmation error and email confirmation is disabled
          const disableEmailConfirmation = process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION === 'true'
          
          if (signInError.message?.includes('Email not confirmed') && disableEmailConfirmation) {
            // If email confirmation is disabled, don't treat this as an error
            console.log('Email confirmation error ignored due to DISABLE_EMAIL_CONFIRMATION flag')
            return { data: null, error: null }
          }
          
          const error = { message: signInError.message }
          setError(error)
          return { data: null, error }
        }

        return { data: signInData.session as AuthSession, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to sign up' }
        setError(error)
        return { data: null, error }
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  // Sign in with OAuth provider
  const signInWithOAuth = useCallback(
    async (credentials: OAuthCredentials): Promise<AuthResponse<void>> => {
      setError(null)

      try {
        const { data, error: oauthError } = await supabase.auth.signInWithOAuth(
          {
            provider: credentials.provider as any,
            options: {
              redirectTo:
                credentials.redirectTo ||
                `${window.location.origin}/auth/callback`,
              queryParams: credentials.queryParams,
              scopes: credentials.scopes,
            },
          }
        )

        if (oauthError) {
          const error = { message: oauthError.message }
          setError(error)
          return { data: null, error }
        }

        return { data: null, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to sign in with OAuth' }
        setError(error)
        return { data: null, error }
      }
    },
    [supabase]
  )

  // Sign in with magic link
  const signInWithMagicLink = useCallback(
    async (credentials: MagicLinkCredentials): Promise<AuthResponse<void>> => {
      setError(null)

      try {
        // Validate credentials
        const validation = validateFormData(magicLinkSchema, credentials)
        if (!validation.success) {
          const error = { message: Object.values(validation.errors!)[0] }
          setError(error)
          return { data: null, error }
        }

        const { error: magicLinkError } = await supabase.auth.signInWithOtp({
          email: credentials.email,
          options: {
            emailRedirectTo:
              credentials.redirectTo ||
              `${window.location.origin}/auth/callback`,
          },
        })

        if (magicLinkError) {
          const error = { message: magicLinkError.message }
          setError(error)
          return { data: null, error }
        }

        return { data: null, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to send magic link' }
        setError(error)
        return { data: null, error }
      }
    },
    [supabase]
  )

  // Sign in with phone
  const signInWithPhone = useCallback(
    async (
      credentials: PhoneCredentials
    ): Promise<AuthResponse<AuthSession>> => {
      setError(null)

      try {
        // Validate credentials
        const validation = validateFormData(phoneSchema, credentials)
        if (!validation.success) {
          const error = { message: Object.values(validation.errors!)[0] }
          setError(error)
          return { data: null, error }
        }

        if (credentials.token) {
          // Verify phone with token
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            phone: credentials.phone,
            token: credentials.token,
            type: 'sms',
          })

          if (verifyError) {
            const error = { message: verifyError.message }
            setError(error)
            return { data: null, error }
          }

          return { data: data.session as AuthSession, error: null }
        } else {
          // Send SMS OTP
          const { error: smsError } = await supabase.auth.signInWithOtp({
            phone: credentials.phone,
          })

          if (smsError) {
            const error = { message: smsError.message }
            setError(error)
            return { data: null, error }
          }

          return { data: null, error: null }
        }
      } catch (err: any) {
        const error = {
          message: err.message || 'Failed to authenticate with phone',
        }
        setError(error)
        return { data: null, error }
      }
    },
    [supabase]
  )

  // Sign out
  const signOut = useCallback(async (): Promise<AuthResponse<void>> => {
    setError(null)

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        const error = { message: signOutError.message }
        setError(error)
        return { data: null, error }
      }

      return { data: null, error: null }
    } catch (err: any) {
      const error = { message: err.message || 'Failed to sign out' }
      setError(error)
      return { data: null, error }
    }
  }, [supabase])

  // Reset password
  const resetPassword = useCallback(
    async (
      credentials: ResetPasswordCredentials
    ): Promise<AuthResponse<void>> => {
      setError(null)

      try {
        // Validate credentials
        const validation = validateFormData(resetPasswordSchema, credentials)
        if (!validation.success) {
          const error = { message: Object.values(validation.errors!)[0] }
          setError(error)
          return { data: null, error }
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          credentials.email,
          {
            redirectTo:
              credentials.redirectTo ||
              `${window.location.origin}/auth/reset-password`,
          }
        )

        if (resetError) {
          const error = { message: resetError.message }
          setError(error)
          return { data: null, error }
        }

        return { data: null, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to send reset email' }
        setError(error)
        return { data: null, error }
      }
    },
    [supabase]
  )

  // Update password
  const updatePassword = useCallback(
    async (
      credentials: UpdatePasswordCredentials
    ): Promise<AuthResponse<void>> => {
      setError(null)

      try {
        // Validate credentials
        const validation = validateFormData(updatePasswordSchema, credentials)
        if (!validation.success) {
          const error = { message: Object.values(validation.errors!)[0] }
          setError(error)
          return { data: null, error }
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: credentials.password,
        })

        if (updateError) {
          const error = { message: updateError.message }
          setError(error)
          return { data: null, error }
        }

        return { data: null, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to update password' }
        setError(error)
        return { data: null, error }
      }
    },
    [supabase]
  )

  // Update profile
  const updateProfile = useCallback(
    async (data: UpdateProfileData): Promise<AuthResponse<AuthUserProfile>> => {
      setError(null)

      try {
        const { data: updateData, error: updateError } =
          await supabase.auth.updateUser({
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              full_name:
                data.firstName && data.lastName
                  ? `${data.firstName} ${data.lastName}`
                  : undefined,
              avatar_url: data.avatarUrl,
              timezone: data.timezone,
              locale: data.locale,
            },
          })

        if (updateError) {
          const error = { message: updateError.message }
          setError(error)
          return { data: null, error }
        }

        // Create profile response
        const profile: AuthUserProfile = {
          id: updateData.user.id,
          email: updateData.user.email!,
          firstName:
            data.firstName || updateData.user.user_metadata.first_name || '',
          lastName:
            data.lastName || updateData.user.user_metadata.last_name || '',
          fullName: updateData.user.user_metadata.full_name || '',
          avatarUrl: data.avatarUrl || updateData.user.user_metadata.avatar_url,
          timezone:
            data.timezone || updateData.user.user_metadata.timezone || 'UTC',
          locale: data.locale || updateData.user.user_metadata.locale || 'en',
          emailVerified: !!updateData.user.email_confirmed_at,
          phoneVerified: !!updateData.user.phone_confirmed_at,
          twoFactorEnabled: false,
          createdAt: new Date(updateData.user.created_at),
          updatedAt: new Date(),
        }

        return { data: profile, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to update profile' }
        setError(error)
        return { data: null, error }
      }
    },
    [supabase]
  )

  // Refresh session
  const refreshSession = useCallback(async (): Promise<
    AuthResponse<AuthSession>
  > => {
    setError(null)

    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError) {
        const error = { message: refreshError.message }
        setError(error)
        return { data: null, error }
      }

      return { data: data.session as AuthSession, error: null }
    } catch (err: any) {
      const error = { message: err.message || 'Failed to refresh session' }
      setError(error)
      return { data: null, error }
    }
  }, [supabase])

  // Resend verification email
  const resendVerification = useCallback(async (): Promise<
    AuthResponse<void>
  > => {
    if (!user?.email) {
      const error = { message: 'No user email found' }
      setError(error)
      return { data: null, error }
    }

    setError(null)

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })

      if (resendError) {
        const error = { message: resendError.message }
        setError(error)
        return { data: null, error }
      }

      return { data: null, error: null }
    } catch (err: any) {
      const error = { message: err.message || 'Failed to resend verification' }
      setError(error)
      return { data: null, error }
    }
  }, [user?.email, supabase])

  // Verify email with token
  const verifyEmail = useCallback(
    async (token: string): Promise<AuthResponse<void>> => {
      setError(null)

      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        })

        if (verifyError) {
          const error = { message: verifyError.message }
          setError(error)
          return { data: null, error }
        }

        return { data: null, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to verify email' }
        setError(error)
        return { data: null, error }
      }
    },
    [supabase]
  )

  const contextValue: AuthContextValue = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signInWithOAuth,
    signInWithMagicLink,
    signInWithPhone,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    resendVerification,
    verifyEmail,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

// Helper function to create organization for new users
async function createUserOrganization(
  userId: string,
  organizationName: string
) {
  // Use service role client for organization creation during signup
  // since the user doesn't have a valid session yet
  const { createClient } = await import('@supabase/supabase-js')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration missing for organization creation')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Generate a slug from the organization name
  const slug = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)

  // Add timestamp to ensure uniqueness
  const uniqueSlug = `${slug}-${Date.now()}`

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: organizationName,
      slug: uniqueSlug,
      created_by: userId,
    })
    .select()
    .single()

  if (orgError) throw orgError

  // Create membership
  const { error: membershipError } = await supabase
    .from('organization_members')
    .insert({
      user_id: userId,
      organization_id: org.id,
      role: 'owner',
    })

  if (membershipError) throw membershipError

  return org
}
