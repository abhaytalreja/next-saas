'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../hooks'
import { UserAvatar } from '../ui/UserAvatar'
import { Button, Input, Alert } from '@nextsaas/ui'
import { CameraIcon, TrashIcon, ArrowUpTrayIcon, CheckIcon } from '@heroicons/react/24/outline'
import { avatarService } from '../../services/avatar-service'
import { profileFormSchema, type ProfileFormData } from '../../validation/profile-schemas'
import type { UserAvatar as UserAvatarType } from '../../types/user'

interface EnhancedProfileFormProps {
  onSuccess?: () => void
  className?: string
  showAdvancedFields?: boolean
}

export function EnhancedProfileForm({ 
  onSuccess, 
  className = '',
  showAdvancedFields = true 
}: EnhancedProfileFormProps) {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatars, setAvatars] = useState<UserAvatarType[]>([])
  const [currentAvatar, setCurrentAvatar] = useState<UserAvatarType | null>(null)
  const [profileCompleteness, setProfileCompleteness] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: user?.user_metadata?.first_name || '',
      last_name: user?.user_metadata?.last_name || '',
      display_name: user?.user_metadata?.display_name || '',
      bio: user?.user_metadata?.bio || '',
      phone: user?.user_metadata?.phone || '',
      website: user?.user_metadata?.website || '',
      job_title: user?.user_metadata?.job_title || '',
      company: user?.user_metadata?.company || '',
      department: user?.user_metadata?.department || '',
      location: user?.user_metadata?.location || '',
      timezone: user?.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: user?.user_metadata?.locale || navigator.language,
    },
  })

  // Watch form values for completeness calculation
  const watchedValues = watch()

  // Calculate profile completeness
  React.useEffect(() => {
    const calculateCompleteness = () => {
      const requiredFields = ['first_name', 'last_name']
      const optionalFields = ['display_name', 'bio', 'phone', 'website', 'job_title', 'company', 'location']
      
      let completedRequired = 0
      let completedOptional = 0
      
      requiredFields.forEach(field => {
        if (watchedValues[field as keyof ProfileFormData]?.trim()) {
          completedRequired++
        }
      })
      
      optionalFields.forEach(field => {
        if (watchedValues[field as keyof ProfileFormData]?.trim()) {
          completedOptional++
        }
      })
      
      // Weight required fields more heavily
      const requiredWeight = 0.7
      const optionalWeight = 0.3
      const avatarWeight = 0.1
      
      const requiredScore = (completedRequired / requiredFields.length) * requiredWeight
      const optionalScore = (completedOptional / optionalFields.length) * optionalWeight
      const avatarScore = currentAvatar ? avatarWeight : 0
      
      const totalScore = Math.round((requiredScore + optionalScore + avatarScore) * 100)
      setProfileCompleteness(Math.min(totalScore, 100))
    }
    
    calculateCompleteness()
  }, [watchedValues, currentAvatar])

  // Load user avatars on mount
  React.useEffect(() => {
    if (user) {
      loadUserAvatars()
    }
  }, [user])

  const loadUserAvatars = async () => {
    if (!user) return
    
    try {
      const userAvatars = await avatarService.getUserAvatars(user.id)
      setAvatars(userAvatars)
      
      const activeAvatar = userAvatars.find(avatar => avatar.is_active)
      setCurrentAvatar(activeAvatar || null)
    } catch (error) {
      console.error('Failed to load avatars:', error)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name,
        bio: data.bio,
        phone: data.phone,
        website: data.website,
        job_title: data.job_title,
        company: data.company,
        department: data.department,
        location: data.location,
        timezone: data.timezone,
        locale: data.locale,
        avatar_url: currentAvatar?.public_url,
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploadingAvatar(true)
    setError(null)

    try {
      const result = await avatarService.uploadAvatar(file, user.id, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        quality: 0.9,
        outputSize: 256,
      })

      if (result.success && result.avatar) {
        // Add to avatars list
        setAvatars(prev => [result.avatar!, ...prev])
        
        // Auto-activate if it's the first avatar
        if (avatars.length === 0) {
          await activateAvatar(result.avatar.id)
        }
      } else {
        setError(result.error || 'Failed to upload avatar')
      }
    } catch (err) {
      setError('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const activateAvatar = async (avatarId: string) => {
    if (!user) return

    try {
      const success = await avatarService.activateAvatar(avatarId, user.id)
      if (success) {
        await loadUserAvatars()
      }
    } catch (error) {
      console.error('Failed to activate avatar:', error)
    }
  }

  const deleteAvatar = async (avatarId: string) => {
    if (!user) return

    try {
      const success = await avatarService.deleteAvatar(avatarId, user.id)
      if (success) {
        await loadUserAvatars()
      }
    } catch (error) {
      console.error('Failed to delete avatar:', error)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 80) return 'text-green-600'
    if (completeness >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompletenessBarColor = (completeness: number) => {
    if (completeness >= 80) return 'bg-green-500'
    if (completeness >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 ${className}`} data-testid="profile-form" role="form">
      {/* Profile Completeness Indicator */}
      <div className="bg-gray-50 rounded-lg p-4" data-testid="profile-completeness">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Profile Completeness</h3>
          <span className={`text-sm font-semibold ${getCompletenessColor(profileCompleteness)}`} data-testid="completeness-percentage">
            {profileCompleteness}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getCompletenessBarColor(profileCompleteness)}`}
            style={{ width: `${profileCompleteness}%` }}
          />
        </div>
        {profileCompleteness < 100 && (
          <p className="text-xs text-gray-600 mt-2" data-testid="completeness-suggestions">
            Complete your profile to help others discover and connect with you
          </p>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert type="error" onClose={() => setError(null)} data-testid="profile-save-error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(false)} data-testid="profile-save-success">
          Profile updated successfully!
        </Alert>
      )}

      {/* Avatar Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
        
        <div className="flex items-start gap-6">
          {/* Current Avatar Display */}
          <div className="flex-shrink-0" data-testid="avatar-preview">
            <UserAvatar
              src={currentAvatar?.public_url}
              firstName={user?.user_metadata?.first_name}
              lastName={user?.user_metadata?.last_name}
              email={user?.email}
              size="2xl"
            />
          </div>

          {/* Avatar Actions */}
          <div className="flex-1">
            <div className="flex gap-3 mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
                data-testid="avatar-upload-input"
                aria-label="Upload profile picture"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerFileUpload}
                disabled={uploadingAvatar}
                className="inline-flex items-center"
                data-testid="avatar-upload-button"
              >
                {uploadingAvatar ? (
                  <>
                    <ArrowUpTrayIcon className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CameraIcon className="h-4 w-4 mr-2" />
                    Upload New
                  </>
                )}
              </Button>

              {currentAvatar && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => deleteAvatar(currentAvatar.id)}
                  className="inline-flex items-center text-red-600 hover:text-red-700"
                  data-testid="remove-avatar-button"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            <p className="text-sm text-gray-600">
              Upload a photo to help people recognize you. JPG, PNG or WebP. Max size 5MB.
            </p>

            {/* Avatar Gallery */}
            {avatars.length > 1 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Choose from uploaded photos</h4>
                <div className="flex gap-2 flex-wrap">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                        avatar.is_active
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => !avatar.is_active && activateAvatar(avatar.id)}
                    >
                      <img
                        src={avatar.variants?.small || avatar.public_url}
                        alt="Avatar option"
                        className="w-12 h-12 object-cover"
                      />
                      {avatar.is_active && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                          <CheckIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Input
              label="First Name"
              type="text"
              autoComplete="given-name"
              {...register('first_name')}
              error={errors.first_name?.message}
              required
              data-testid="first-name-input"
              aria-label="First Name"
            />
          </div>

          <div>
            <Input
              label="Last Name"
              type="text"
              autoComplete="family-name"
              {...register('last_name')}
              error={errors.last_name?.message}
              required
              data-testid="last-name-input"
              aria-label="Last Name"
            />
          </div>
        </div>

        <div className="mt-6">
          <Input
            label="Display Name"
            type="text"
            {...register('display_name')}
            error={errors.display_name?.message}
            helperText="How you'd like others to see your name"
            data-testid="display-name-input"
            aria-label="Display Name"
          />
        </div>

        <div className="mt-6">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            {...register('bio')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Tell us a little about yourself..."
            data-testid="bio-input"
            aria-label="Bio"
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Input
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+1 (555) 123-4567"
              data-testid="phone-input"
              aria-label="Phone Number"
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

        <div className="mt-6">
          <Input
            label="Location"
            type="text"
            {...register('location')}
            error={errors.location?.message}
            placeholder="New York, NY"
            data-testid="location-input"
            aria-label="Location"
          />
        </div>
      </div>

      {/* Professional Information */}
      {showAdvancedFields && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Input
                label="Job Title"
                type="text"
                {...register('job_title')}
                error={errors.job_title?.message}
                placeholder="Software Engineer"
                data-testid="job-title-input"
                aria-label="Job Title"
              />
            </div>

            <div>
              <Input
                label="Company"
                type="text"
                {...register('company')}
                error={errors.company?.message}
                placeholder="Acme Corp"
                data-testid="company-input"
                aria-label="Company"
              />
            </div>
          </div>

          <div className="mt-6">
            <Input
              label="Department"
              type="text"
              {...register('department')}
              error={errors.department?.message}
              placeholder="Engineering"
            />
          </div>
        </div>
      )}

      {/* Localization Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Localization</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select
              id="timezone"
              {...register('timezone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              data-testid="timezone-select"
            >
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Denver">Mountain Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Europe/Berlin">Berlin</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
            {errors.timezone && (
              <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
            )}
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
            {errors.locale && (
              <p className="mt-1 text-sm text-red-600">{errors.locale.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          disabled={!isDirty || loading}
          data-testid="save-profile-button"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}