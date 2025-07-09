'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@nextsaas/auth'
import { ForgotPasswordForm } from '@nextsaas/auth'
import { Alert } from '@nextsaas/ui'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail)
    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a password reset link"
      >
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <Alert type="success" className="mb-6 text-left">
              <p className="text-sm">
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your email and follow the instructions to reset
                your password.
              </p>
            </Alert>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or try again
                with a different email address.
              </p>

              <button
                onClick={() => setSuccess(false)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                aria-label="Try with different email"
              >
                Try Another Email
              </button>

              <Link
                href="/auth/sign-in"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              href="/auth/sign-in"
              className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <div className="text-center">
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>
        </div>
      }
    >
      <ForgotPasswordForm onSuccess={handleSuccess} className="space-y-6" />

      {/* Additional help section */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="text-sm text-gray-600 space-y-4">
          <p>
            <strong>Tip:</strong> Password reset links expire after 1 hour for
            security reasons.
          </p>
          <p>If you're having trouble accessing your account, you can also:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Check if you signed up with a different email address</li>
            <li>
              Try signing in with Google, GitHub, or other social providers
            </li>
            <li>
              <Link
                href="/support"
                className="text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
              >
                Contact our support team
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </AuthLayout>
  )
}
