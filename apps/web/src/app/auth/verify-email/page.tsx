'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AuthLayout } from '@/packages/auth'
import { Button, Alert, Spinner } from '@/packages/ui'
import Link from 'next/link'
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resendCooldown, setResendCooldown] = useState(0)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token) {
      handleVerification()
    } else {
      setVerificationState('error')
      setErrorMessage('No verification token provided')
    }
  }, [token])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerification = async () => {
    try {
      setVerificationState('loading')
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setVerificationState('success')
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setVerificationState('error')
        setErrorMessage(result.error || 'Verification failed')
        if (result.code === 'TOKEN_EXPIRED') {
          setVerificationState('expired')
        }
      }
    } catch (error) {
      setVerificationState('error')
      setErrorMessage('An unexpected error occurred during verification')
    }
  }

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return

    try {
      setResendState('sending')
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setResendState('sent')
        setResendCooldown(60) // 60 second cooldown
      } else {
        setResendState('error')
      }
    } catch (error) {
      setResendState('error')
    }
  }

  const renderContent = () => {
    switch (verificationState) {
      case 'loading':
        return (
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Verifying your email...
            </h3>
            <p className="text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Email verified successfully!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your email has been verified. Redirecting you to the dashboard...
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
              aria-label="Go to dashboard"
            >
              Go to Dashboard
            </Button>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <XCircleIcon className="h-10 w-10 text-yellow-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Verification link expired
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This verification link has expired. Please request a new one.
            </p>
            {email && (
              <>
                <Button
                  onClick={handleResendEmail}
                  disabled={resendState === 'sending' || resendCooldown > 0}
                  className="w-full mb-4"
                  variant={resendState === 'sent' ? 'success' : 'primary'}
                  aria-label={resendCooldown > 0 ? `Resend available in ${resendCooldown} seconds` : 'Resend verification email'}
                >
                  {resendState === 'sending' ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : resendState === 'sent' ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Email Sent!
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
                {resendState === 'error' && (
                  <Alert type="error" className="mb-4">
                    Failed to resend email. Please try again.
                  </Alert>
                )}
              </>
            )}
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <XCircleIcon className="h-10 w-10 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Verification failed
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {errorMessage || 'We couldn\'t verify your email address.'}
            </p>
            <div className="space-y-3">
              <Link href="/auth/sign-in" className="block">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up" className="block">
                <Button variant="ghost" className="w-full">
                  Create New Account
                </Button>
              </Link>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AuthLayout
      title="Email Verification"
      subtitle={verificationState === 'loading' ? 'Verifying your email address...' : undefined}
    >
      <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10" role="main" aria-live="polite">
        {renderContent()}
      </div>

      {/* Additional help text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Having trouble?{' '}
          <Link href="/support" className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline">
            Contact support
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}