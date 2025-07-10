'use client'

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks'
import { UserAvatar } from '../ui/UserAvatar'
import { useMobileDetection, useBreakpoint } from '../../hooks/useMobileDetection'
import { MobileOptimizedForm, MobileFieldGroup, MobileInput, MobileButton } from '../ui/MobileOptimizedForm'
import { Button, Input, Alert } from '@nextsaas/ui'
import { CameraIcon, TrashIcon, UserIcon, GlobeAltIcon, PhoneIcon } from '@heroicons/react/24/outline'

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

interface MobileProfileFormProps {
  onSuccess?: () => void
  className?: string
}

export function MobileProfileForm({ onSuccess, className = '' }: MobileProfileFormProps) {
  const { user, updateProfile } = useAuth()
  const { isMobileOrTablet } = useBreakpoint()
  const { isTouchDevice } = useMobileDetection()
  
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

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Render desktop version for larger screens
  if (!isMobileOrTablet) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
        {/* Desktop form content - same as original ProfileForm */}
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

        {/* Desktop layout... */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="First Name"
            type="text"
            autoComplete="given-name"
            {...register('firstName')}
            error={errors.firstName?.message}
            required
          />
          
          <Input
            label="Last Name"
            type="text"
            autoComplete="family-name"
            {...register('lastName')}
            error={errors.lastName?.message}
            required
          />
        </div>

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

  // Mobile-optimized version
  return (
    <div className={className}>
      {error && (
        <Alert type="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(false)} className="mb-4">
          Profile updated successfully!
        </Alert>
      )}

      <MobileOptimizedForm 
        onSubmit={handleSubmit(onSubmit)}
        stickyFooter={true}
        spacing="normal"
      >
        {/* Avatar Section */}
        <MobileFieldGroup 
          title="Profile Picture"
          description="Upload and manage your profile picture"
          className="mb-6"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <UserAvatar
                src={avatarUrl}
                firstName={user?.user_metadata?.first_name}
                lastName={user?.user_metadata?.last_name}
                email={user?.email}
                size="2xl"
              />
              
              {/* Mobile-friendly camera button overlay */}
              <button
                type="button"
                onClick={triggerFileUpload}
                className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label="Change profile picture"
              >
                <CameraIcon className="h-5 w-5" />
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload-mobile"
            />
            
            <div className="flex space-x-3">
              <MobileButton
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerFileUpload}
                leftIcon={<CameraIcon className="h-4 w-4" />}
              >
                Change Photo
              </MobileButton>
              
              {avatarUrl && (
                <MobileButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeAvatar}
                  leftIcon={<TrashIcon className="h-4 w-4" />}
                >
                  Remove
                </MobileButton>
              )}
            </div>
            
            <p className="text-xs text-gray-500 text-center px-4">
              Upload an image up to 5MB. Supported formats: JPG, PNG, GIF.
            </p>
          </div>
        </MobileFieldGroup>

        {/* Basic Information */}
        <MobileFieldGroup 
          title="Basic Information"
          description="Your personal details"
          collapsible={false}
        >
          <div className="space-y-4">
            <MobileInput
              label="First Name"
              type="text"
              autoComplete="given-name"
              leftIcon={<UserIcon />}
              {...register('firstName')}
              error={errors.firstName?.message}
              required
            />
            
            <MobileInput
              label="Last Name"
              type="text"
              autoComplete="family-name"
              leftIcon={<UserIcon />}
              {...register('lastName')}
              error={errors.lastName?.message}
              required
            />
            
            <MobileInput
              label="Email Address"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
              disabled
              helperText="Email cannot be changed here. Use security settings to update your email."
            />
          </div>
        </MobileFieldGroup>

        {/* Bio Section */}
        <MobileFieldGroup 
          title="About"
          description="Tell us about yourself"
          collapsible={true}
          defaultExpanded={false}
        >
          <div>
            <label 
              htmlFor="bio-mobile" 
              className="block text-base font-medium text-gray-700 mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio-mobile"
              rows={4}
              {...register('bio')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-base py-3 px-4"
              placeholder="Tell us a little about yourself..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-2">
              Share a brief description about yourself (up to 500 characters)
            </p>
            {errors.bio && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.bio.message}
              </p>
            )}
          </div>
        </MobileFieldGroup>

        {/* Contact Information */}
        <MobileFieldGroup 
          title="Contact"
          description="How people can reach you"
          collapsible={true}
          defaultExpanded={false}
        >
          <div className="space-y-4">
            <MobileInput
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              leftIcon={<PhoneIcon />}
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+1 (555) 123-4567"
            />
            
            <MobileInput
              label="Website"
              type="url"
              autoComplete="url"
              leftIcon={<GlobeAltIcon />}
              {...register('website')}
              error={errors.website?.message}
              placeholder="https://example.com"
            />
          </div>
        </MobileFieldGroup>

        {/* Regional Settings */}
        <MobileFieldGroup 
          title="Regional Settings"
          description="Language and timezone preferences"
          collapsible={true}
          defaultExpanded={false}
        >
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="timezone-mobile" 
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Timezone
              </label>
              <select
                id="timezone-mobile"
                {...register('timezone')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-base py-3 px-4"
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
              <p className="text-xs text-gray-500 mt-2">
                Used for displaying dates and times in your local time
              </p>
            </div>

            <div>
              <label 
                htmlFor="locale-mobile" 
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Language
              </label>
              <select
                id="locale-mobile"
                {...register('locale')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-base py-3 px-4"
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
              <p className="text-xs text-gray-500 mt-2">
                Language for interface and date formatting
              </p>
            </div>
          </div>
        </MobileFieldGroup>
      </MobileOptimizedForm>

      {/* Sticky Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="flex space-x-3">
          <MobileButton
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </MobileButton>
          <MobileButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!isDirty || loading}
            onClick={handleSubmit(onSubmit)}
            className="flex-1"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </MobileButton>
        </div>
      </div>
    </div>
  )
}