'use client'

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks'
import { UserAvatar } from '../ui/UserAvatar'
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
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(false)}>
          Profile updated successfully!
        </Alert>
      )}

      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          <UserAvatar
            src={avatarUrl}
            firstName={user?.user_metadata?.first_name}
            lastName={user?.user_metadata?.last_name}
            email={user?.email}
            size="xl"
          />
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
            >
              <CameraIcon className="h-4 w-4 mr-1.5" />
              Change
            </label>
            {avatarUrl && (
              <button
                type="button"
                onClick={removeAvatar}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-1.5" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

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
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
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
          />
        </div>
      </div>

      {/* Locale Settings */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
            Timezone
          </label>
          <select
            id="timezone"
            {...register('timezone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
        </div>

        <div>
          <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            id="locale"
            {...register('locale')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          disabled={!isDirty || loading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}