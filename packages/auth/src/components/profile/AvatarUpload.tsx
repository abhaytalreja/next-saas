'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '../../hooks'
import { UserAvatar } from '../ui/UserAvatar'
import { Button } from '@nextsaas/ui'
import { CameraIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

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
      // Here you would implement actual file upload to your storage service
      // For now, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const uploadedUrl = previewUrl // In real implementation, this would be the uploaded URL
      
      // Update user profile with new avatar URL
      const result = await updateProfile({
        avatarUrl: uploadedUrl,
      })

      if (result.error) {
        onError?.(result.error.message)
        setPreviewUrl(null)
      } else {
        onSuccess?.(uploadedUrl || '')
      }
    } catch (error) {
      onError?.('Failed to upload avatar')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    try {
      const result = await updateProfile({
        avatarUrl: null,
      })

      if (result.error) {
        onError?.(result.error.message)
      } else {
        setPreviewUrl(null)
        onSuccess?.('')
      }
    } catch (error) {
      onError?.('Failed to remove avatar')
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