'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks'
import { Button, Input, Alert } from '@nextsaas/ui'
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>

interface UpdatePasswordFormProps {
  onSuccess?: () => void
  className?: string
}

export function UpdatePasswordForm({ onSuccess, className = '' }: UpdatePasswordFormProps) {
  const { updatePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  })

  const newPassword = watch('newPassword', '')

  // Password strength indicators
  const passwordChecks = [
    { test: newPassword.length >= 8, label: 'At least 8 characters' },
    { test: /[A-Z]/.test(newPassword), label: 'One uppercase letter' },
    { test: /[a-z]/.test(newPassword), label: 'One lowercase letter' },
    { test: /[0-9]/.test(newPassword), label: 'One number' },
    { test: /[^A-Za-z0-9]/.test(newPassword), label: 'One special character' },
  ]

  const passwordStrength = passwordChecks.filter(check => check.test).length
  const strengthLevel = passwordStrength === 5 ? 'strong' : passwordStrength >= 3 ? 'medium' : 'weak'
  const strengthColor = strengthLevel === 'strong' ? 'green' : strengthLevel === 'medium' ? 'yellow' : 'red'

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updatePassword({
        password: data.newPassword,
        confirmPassword: data.confirmPassword,
      })

      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess(true)
        reset()
        onSuccess?.()
        
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(false)}>
          Password updated successfully!
        </Alert>
      )}

      {/* Current Password */}
      <div className="relative">
        <Input
          label="Current Password"
          type={showCurrentPassword ? 'text' : 'password'}
          autoComplete="current-password"
          {...register('currentPassword')}
          error={errors.currentPassword?.message}
          required
        />
        <button
          type="button"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
        >
          {showCurrentPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* New Password */}
      <div>
        <div className="relative">
          <Input
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('newPassword')}
            error={errors.newPassword?.message}
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
          >
            {showNewPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {newPassword && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Password strength:</span>
              <span className={`text-xs font-medium text-${strengthColor}-600`}>
                {strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-${strengthColor}-500 transition-all duration-300`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              />
            </div>
            <ul className="mt-2 space-y-1">
              {passwordChecks.map((check, index) => (
                <li key={index} className="flex items-center text-xs">
                  {check.test ? (
                    <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <XMarkIcon className="h-4 w-4 text-gray-300 mr-1" />
                  )}
                  <span className={check.test ? 'text-green-700' : 'text-gray-500'}>
                    {check.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <Input
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
        >
          {showConfirmPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Submit Button */}
      <div>
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          Update Password
        </Button>
      </div>

      {/* Security Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Security Tips:</h4>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Use a unique password that you don't use on other sites</li>
          <li>Consider using a password manager</li>
          <li>Enable two-factor authentication for extra security</li>
          <li>Never share your password with anyone</li>
        </ul>
      </div>
    </form>
  )
}