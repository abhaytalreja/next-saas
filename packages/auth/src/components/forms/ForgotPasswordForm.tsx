'use client'

import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { validateFormData, resetPasswordSchema } from '../../utils/validation'
import { Button, Input } from '@nextsaas/ui'
import type { ResetPasswordCredentials } from '../../types'

interface ForgotPasswordFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function ForgotPasswordForm({
  onSuccess,
  onError,
}: ForgotPasswordFormProps) {
  const { resetPassword, loading } = useAuth()
  const [formData, setFormData] = useState<ResetPasswordCredentials>({
    email: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)
    setIsSuccess(false)

    // Validate form data
    const validation = validateFormData(resetPasswordSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors || {})
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await resetPassword(formData)

      if (error) {
        setErrors({ general: error.message })
        onError?.(error.message)
        setIsSubmitting(false)
        return
      }

      setIsSuccess(true)
      onSuccess?.()
    } catch (err: any) {
      setErrors({ general: err.message || 'An unexpected error occurred' })
      onError?.(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Check your email
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  We've sent a password reset link to{' '}
                  <strong>{formData.email}</strong>. Please check your inbox and
                  follow the instructions.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <a
            href="/auth/login"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Back to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Password reset failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errors.general}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
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
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Enter the email address associated with your account and we'll send
          you a link to reset your password.
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
        >
          Send reset link
        </Button>
      </div>

      <div className="text-center">
        <a
          href="/auth/login"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Back to login
        </a>
      </div>
    </form>
  )
}
