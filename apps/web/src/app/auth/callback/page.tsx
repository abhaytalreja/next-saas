'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/packages/auth'
import { Spinner, Alert } from '@/packages/ui'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Handle OAuth errors
        if (error) {
          console.error('OAuth error:', error, errorDescription)
          setError(errorDescription || error || 'Authentication failed')
          setStatus('error')
          return
        }

        if (!code) {
          setError('No authorization code found')
          setStatus('error')
          return
        }

        // Create Supabase client
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Exchange code for session
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (sessionError) {
          console.error('Session exchange error:', sessionError)
          setError(sessionError.message)
          setStatus('error')
          return
        }

        // Get the updated session
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession()

        if (getSessionError || !session) {
          setError('Failed to establish session')
          setStatus('error')
          return
        }

        setStatus('success')

        // Check if user needs to complete profile or organization setup
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('id', session.user.id)
          .single()

        const { data: memberships } = await supabase
          .from('memberships')
          .select('organization_id')
          .eq('user_id', session.user.id)

        // Determine redirect path
        let redirectPath = '/dashboard'
        
        if (!profile?.first_name || !profile?.last_name) {
          // User needs to complete profile
          redirectPath = '/onboarding/profile'
        } else if (!memberships || memberships.length === 0) {
          // User needs to create or join organization
          redirectPath = '/onboarding/organization'
        }

        // Get the intended redirect from state or session storage
        const intendedRedirect = searchParams.get('redirect_to') || 
          sessionStorage.getItem('auth_redirect') || 
          redirectPath

        // Clear stored redirect
        sessionStorage.removeItem('auth_redirect')

        // Redirect to the appropriate page
        router.push(intendedRedirect)
      } catch (err) {
        console.error('Callback error:', err)
        setError('An unexpected error occurred')
        setStatus('error')
      }
    }

    handleCallback()
  }, [router, searchParams])

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Completing sign in...
            </h3>
            <p className="text-sm text-gray-600">
              Please wait while we complete your authentication.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sign in successful!
            </h3>
            <p className="text-sm text-gray-600">
              Redirecting you to your dashboard...
            </p>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <Alert type="error" className="mb-6 text-left">
              {error || 'Authentication failed. Please try again.'}
            </Alert>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/auth/sign-in')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label="Return to sign in page"
              >
                Back to Sign In
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label="Return to home page"
              >
                Go to Home
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AuthLayout
      title="Completing Authentication"
      subtitle={status === 'processing' ? 'Please wait...' : undefined}
    >
      <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10" role="main" aria-live="polite">
        {renderContent()}
      </div>

      {/* Additional help text */}
      {status === 'error' && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble signing in?{' '}
            <a 
              href="/support" 
              className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      )}
    </AuthLayout>
  )
}