'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '../../hooks'
import { UserAvatar } from '../ui/UserAvatar'
import { Button } from '@nextsaas/ui'
import { CameraIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { avatarService } from '../../services/avatar-service'

interface AvatarUploadProps {
  'data-testid'?: string
  className?: string
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

export function AvatarUpload({
  'data-testid': dataTestId,
  className = '',
  onSuccess,
  onError,
}: AvatarUploadProps) {
  const { user, updateProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentAvatarUrl = previewUrl || user?.user_metadata?.avatar_url

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError?.('Image size must be less than 5MB')
      return
    }

    // Create preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Upload the file (implement actual upload logic here)
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Upload avatar using the avatar service
      const result = await avatarService.uploadAvatar(file, user.id)

      if (!result.success) {
        onError?.(result.error || 'Failed to upload avatar')
        setPreviewUrl(null)
        return
      }

      if (result.avatar) {
        // Activate the newly uploaded avatar
        const activateResult = await avatarService.activateAvatar(result.avatar.id, user.id)
        
        if (activateResult) {
          onSuccess?.(result.avatar.public_url || '')
          // Update the preview to the uploaded image
          setPreviewUrl(result.avatar.public_url)
        } else {
          onError?.('Failed to activate avatar')
          setPreviewUrl(null)
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      onError?.(error instanceof Error ? error.message : 'Failed to upload avatar')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Get current active avatar
      const currentAvatar = await avatarService.getCurrentAvatar(user.id)
      
      if (currentAvatar) {
        // Delete the current avatar
        const result = await avatarService.deleteAvatar(currentAvatar.id, user.id)
        
        if (result) {
          setPreviewUrl(null)
          onSuccess?.('')
        } else {
          onError?.('Failed to remove avatar')
        }
      } else {
        // No avatar to remove
        setPreviewUrl(null)
        onSuccess?.('')
      }
    } catch (error) {
      console.error('Avatar removal error:', error)
      onError?.(error instanceof Error ? error.message : 'Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`} data-testid={dataTestId}>
      {/* Avatar Display */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <UserAvatar
            src={currentAvatarUrl}
            firstName={user?.user_metadata?.first_name}
            lastName={user?.user_metadata?.last_name}
            email={user?.email}
            size="xl"
            data-testid={dataTestId ? `${dataTestId}-avatar` : 'avatar-display'}
          />
          {uploading && (
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
              data-testid={dataTestId ? `${dataTestId}-uploading-overlay` : 'uploading-overlay'}
            >
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            </div>
          )}
        </div>
      </div>

      {/* Upload Controls */}
      <div className="flex justify-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          data-testid={dataTestId ? `${dataTestId}-file-input` : 'avatar-file-input'}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileSelect}
          disabled={uploading}
          data-testid={dataTestId ? `${dataTestId}-upload-button` : 'avatar-upload-button'}
        >
          <CameraIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {currentAvatarUrl ? 'Change' : 'Upload'}
        </Button>

        {currentAvatarUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
            data-testid={dataTestId ? `${dataTestId}-remove-button` : 'avatar-remove-button'}
          >
            <TrashIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Remove
          </Button>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        Upload an image up to 5MB. Supported formats: JPG, PNG, GIF.
      </p>
    </div>
  )
}