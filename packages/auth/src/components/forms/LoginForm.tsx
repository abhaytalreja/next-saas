'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { validateFormData, signInSchema } from '../../utils/validation'
import { Button, Input, Checkbox } from '@nextsaas/ui'
import type { SignInCredentials } from '../../types'

interface LoginFormProps {
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function LoginForm({
  redirectTo = '/dashboard',
  onSuccess,
  onError,
}: LoginFormProps) {
  const { signIn, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<SignInCredentials>({
    email: '',
    password: '',
    remember: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

    // Validate form data
    const validation = validateFormData(signInSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors || {})
      setIsSubmitting(false)
      return
    }

    try {
      const { data, error } = await signIn(formData)

      if (error) {
        setErrors({ general: error.message })
        onError?.(error.message)
        setIsSubmitting(false)
        return
      }

      if (data) {
        onSuccess?.()
        router.push(redirectTo)
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'An unexpected error occurred' })
      onError?.(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Authentication failed
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
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            placeholder="••••••••"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Checkbox
            id="remember"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <label
            htmlFor="remember"
            className="ml-2 block text-sm text-gray-900"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a
            href="/auth/forgot-password"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </a>
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
        >
          Sign in
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>
    </form>
  )
}
