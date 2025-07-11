'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import {
  validateFormData,
  signUpSchema,
  getPasswordStrength,
} from '../../utils/validation'
import { Button, Input, Checkbox } from '@nextsaas/ui'
import type { SignUpCredentials } from '../../types'

interface SignupFormProps {
  includeOrganization?: boolean
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function SignupForm({
  includeOrganization = true,
  redirectTo = '/dashboard',
  onSuccess,
  onError,
}: SignupFormProps) {
  const { signUp, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<SignUpCredentials>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    // Validate form data
    const validation = validateFormData(signUpSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors || {})
      setIsSubmitting(false)
      return
    }

    try {
      const { data, error } = await signUp(formData)

      if (error) {
        setErrors({ general: error.message })
        onError?.(error.message)
        setIsSubmitting(false)
        return
      }

      // Signup was successful
      onSuccess?.()
      
      // Check if email confirmation is disabled
      const disableEmailConfirmation = process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION === 'true'
      
      if (disableEmailConfirmation) {
        // When email confirmation is disabled, redirect to sign-in page
        // User needs to manually sign in after registration
        router.push('/auth/sign-in?message=registration-complete')
      } else if (data) {
        // If user is automatically signed in (email confirmation enabled), go to dashboard
        router.push(redirectTo === '/auth/verify-email' ? '/dashboard' : redirectTo)
      } else {
        // Go to email verification page
        router.push('/auth/verify-email')
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'An unexpected error occurred' })
      onError?.(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500'
    if (passwordStrength.score <= 4) return 'bg-yellow-500'
    if (passwordStrength.score <= 6) return 'bg-blue-500'
    return 'bg-green-500'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="signup-form">
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4" data-testid="signup-error-alert">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Registration failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errors.general}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            First name
          </label>
          <div className="mt-1">
            <Input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={formData.firstName}
              onChange={handleChange}
              error={!!errors.firstName}
              disabled={isSubmitting}
              data-testid="signup-firstname-input"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Last name
          </label>
          <div className="mt-1">
            <Input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={formData.lastName}
              onChange={handleChange}
              error={!!errors.lastName}
              disabled={isSubmitting}
              data-testid="signup-lastname-input"
            />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Email address
        </label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            placeholder="you@example.com"
            disabled={isSubmitting}
            data-testid="signup-email-input"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Password
        </label>
        <div className="mt-1">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            placeholder="••••••••"
            disabled={isSubmitting}
            data-testid="signup-password-input"
          />
        </div>
        {formData.password && (
          <div className="mt-2" data-testid="password-strength-indicator">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                  style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {passwordStrength.score <= 2
                  ? 'Weak'
                  : passwordStrength.score <= 4
                    ? 'Fair'
                    : passwordStrength.score <= 6
                      ? 'Good'
                      : 'Strong'}
              </span>
            </div>
            {passwordStrength.feedback.length > 0 && (
              <ul className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                {passwordStrength.feedback.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {includeOrganization && (
        <div>
          <label
            htmlFor="organizationName"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Organization name (optional)
          </label>
          <div className="mt-1">
            <Input
              id="organizationName"
              name="organizationName"
              type="text"
              value={formData.organizationName}
              onChange={handleChange}
              error={!!errors.organizationName}
              placeholder="Acme Inc."
              disabled={isSubmitting}
              data-testid="signup-organization-input"
            />
          </div>
          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
            Leave blank to join an existing organization later
          </p>
        </div>
      )}

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          By continuing, you agree to our{' '}
          <a
            href="/terms"
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>
          {' '}and{' '}
          <a
            href="/privacy"
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </p>
      </div>

      <div>
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isSubmitting || loading}
          disabled={isSubmitting || loading}
          data-testid="signup-submit-button"
        >
          Create account
        </Button>
      </div>
    </form>
  )
}
