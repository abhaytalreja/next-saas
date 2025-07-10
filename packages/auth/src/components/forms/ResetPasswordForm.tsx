'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import {
  validateFormData,
  updatePasswordSchema,
  getPasswordStrength,
} from '../../utils/validation'
import { Button, Input } from '@nextsaas/ui'
import type { UpdatePasswordCredentials } from '../../types'

interface ResetPasswordFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  'data-testid'?: string
}

export function ResetPasswordForm({
  onSuccess,
  onError,
  'data-testid': dataTestId,
}: ResetPasswordFormProps) {
  const { updatePassword, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<UpdatePasswordCredentials>({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  })

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

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value))
    }

    // Check password match
    if (
      name === 'confirmPassword' ||
      (name === 'password' && formData.confirmPassword)
    ) {
      const password = name === 'password' ? value : formData.password
      const confirmPassword =
        name === 'confirmPassword' ? value : formData.confirmPassword

      if (confirmPassword && password !== confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: "Passwords don't match",
        }))
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    // Validate form data
    const validation = validateFormData(updatePasswordSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors || {})
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await updatePassword(formData)

      if (error) {
        setErrors({ general: error.message })
        onError?.(error.message)
        setIsSubmitting(false)
        return
      }

      onSuccess?.()
      // Redirect to login after successful password reset
      router.push('/auth/login?message=Password+reset+successful')
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
    <form onSubmit={handleSubmit} className="space-y-6" data-testid={dataTestId || 'reset-password-form'}>
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4" data-testid="reset-password-error-alert">
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

      <div className="space-y-1" data-testid="reset-password-header">
        <h2 className="text-2xl font-bold text-gray-900">
          Reset your password
        </h2>
        <p className="text-sm text-gray-600">
          Please enter your new password below.
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          New password
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
            data-testid="reset-password-new-password-input"
          />
        </div>
        {formData.password && (
          <div className="mt-2" data-testid="reset-password-strength-indicator">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                  style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
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
              <ul className="mt-1 text-xs text-gray-500">
                {passwordStrength.feedback.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm new password
        </label>
        <div className="mt-1">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            placeholder="••••••••"
            disabled={isSubmitting}
            data-testid="reset-password-confirm-password-input"
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isSubmitting || loading}
          disabled={isSubmitting || loading}
          data-testid="reset-password-submit-button"
        >
          Reset password
        </Button>
      </div>

      <div className="text-center">
        <a
          href="/auth/login"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
          data-testid="back-to-login-link"
        >
          Back to login
        </a>
      </div>
    </form>
  )
}
