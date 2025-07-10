'use client'

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks'
import { UserAvatar } from '../ui/UserAvatar'
import { OptimizedAvatar } from '../ui/OptimizedImage'
import { ProfileFormSkeleton } from '../ui/LoadingSkeleton'
import { useOptimizedProfile } from '../../hooks/useOptimizedProfile'
import { Button, Input, Alert } from '@nextsaas/ui'
import { CameraIcon, TrashIcon } from '@heroicons/react/24/outline'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio is too long').optional(),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  timezone: z.string().optional(),
  locale: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  onSuccess?: () => void
  className?: string
}

export function ProfileForm({ onSuccess, className = '' }: ProfileFormProps) {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.user_metadata?.first_name || '',
      lastName: user?.user_metadata?.last_name || '',
      email: user?.email || '',
      bio: user?.user_metadata?.bio || '',
      phone: user?.user_metadata?.phone || '',
      website: user?.user_metadata?.website || '',
      timezone: user?.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: user?.user_metadata?.locale || navigator.language,
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        phone: data.phone,
        website: data.website,
        timezone: data.timezone,
        locale: data.locale,
        avatarUrl: avatarUrl || undefined,
      })

      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess(true)
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    // Here you would typically upload to your storage service
    // For now, we'll use a local URL
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
  }

  const removeAvatar = () => {
    setAvatarUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className={`space-y-6 ${className}`}
      noValidate
      aria-label="Edit profile information"
      data-testid="profile-form"
    >
      {error && (
        <Alert type="error" onClose={() => setError(null)} data-testid="profile-error-alert">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(false)} data-testid="profile-success-alert">
          Profile updated successfully!
        </Alert>
      )}

      {/* Avatar Upload */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </legend>
        <div className="flex items-center gap-4" role="group" aria-labelledby="avatar-section" data-testid="avatar-section">
          <div 
            role="img" 
            aria-label={`Current profile picture for ${user?.user_metadata?.first_name || 'User'}`}
          >
            <UserAvatar
              src={avatarUrl}
              firstName={user?.user_metadata?.first_name}
              lastName={user?.user_metadata?.last_name}
              email={user?.email}
              size="xl"
              data-testid="current-avatar"
            />
          </div>
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
              aria-describedby="avatar-help"
              data-testid="avatar-upload-input"
            />
            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              data-testid="avatar-upload-button"
            >
              <CameraIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Change Avatar
            </label>
            {avatarUrl && (
              <button
                type="button"
                onClick={removeAvatar}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="Remove current profile picture"
                data-testid="avatar-remove-button"
              >
                <TrashIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Remove
              </button>
            )}
          </div>
        </div>
        <p id="avatar-help" className="mt-1 text-xs text-gray-500">
          Upload an image up to 5MB. Supported formats: JPG, PNG, GIF.
        </p>
      </fieldset>

      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Input
            label="First Name"
            type="text"
            autoComplete="given-name"
            {...register('firstName')}
            error={errors.firstName?.message}
            required
            data-testid="profile-firstname-input"
          />
        </div>

        <div>
          <Input
            label="Last Name"
            type="text"
            autoComplete="family-name"
            {...register('lastName')}
            error={errors.lastName?.message}
            required
            data-testid="profile-lastname-input"
          />
        </div>
      </div>

      {/* Email Field (read-only) */}
      <div>
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
          disabled
          helperText="Email cannot be changed here. Use security settings to update your email."
          data-testid="profile-email-input"
        />
      </div>

      {/* Bio Field */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          {...register('bio')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Tell us a little about yourself..."
          aria-describedby={errors.bio ? 'bio-error' : 'bio-help'}
          maxLength={500}
          data-testid="profile-bio-textarea"
        />
        <p id="bio-help" className="mt-1 text-xs text-gray-500">
          Share a brief description about yourself (up to 500 characters)
        </p>
        {errors.bio && (
          <p id="bio-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.bio.message}
          </p>
        )}
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Input
            label="Phone Number"
            type="tel"
            autoComplete="tel"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="+1 (555) 123-4567"
            data-testid="profile-phone-input"
          />
        </div>

        <div>
          <Input
            label="Website"
            type="url"
            autoComplete="url"
            {...register('website')}
            error={errors.website?.message}
            placeholder="https://example.com"
            data-testid="profile-website-input"
          />
        </div>
      </div>

      {/* Locale Settings */}
      <fieldset>
        <legend className="text-base font-medium text-gray-900 mb-4">
          Regional Settings
        </legend>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select
              id="timezone"
              {...register('timezone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              aria-describedby="timezone-help"
              data-testid="profile-timezone-select"
            >
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Denver">Mountain Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
            <p id="timezone-help" className="mt-1 text-xs text-gray-500">
              Used for displaying dates and times in your local time
            </p>
          </div>

          <div>
            <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              id="locale"
              {...register('locale')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              aria-describedby="locale-help"
              data-testid="profile-locale-select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
            <p id="locale-help" className="mt-1 text-xs text-gray-500">
              Language for interface and date formatting
            </p>
          </div>
        </div>
      </fieldset>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          disabled={!isDirty || loading}
          data-testid="profile-save-button"
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}