'use client'

import React, { useState } from 'react'
import { UserAvatar } from './UserAvatar'
import { useMobileDetection, useTouchInteractions } from '../../hooks/useMobileDetection'
import { CameraIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

interface TouchOptimizedAvatarProps {
  src?: string | null
  firstName?: string
  lastName?: string
  email?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  onUpload?: (file: File) => void
  onRemove?: () => void
  onView?: () => void
  editable?: boolean
  className?: string
}

export function TouchOptimizedAvatar({
  src,
  firstName,
  lastName,
  email,
  size = 'lg',
  onUpload,
  onRemove,
  onView,
  editable = true,
  className = ''
}: TouchOptimizedAvatarProps) {
  const { isTouchDevice, isMobile } = useMobileDetection()
  const { touchHandlers, isLongPress } = useTouchInteractions()
  const [showActions, setShowActions] = useState(false)
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null)

  // Handle touch interactions
  const handleTouchEnd = () => {
    touchHandlers.onTouchEnd()
    if (isLongPress) {
      setShowActions(true)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onUpload) {
      onUpload(file)
    }
    setShowActions(false)
  }

  const triggerFileUpload = () => {
    fileInputRef?.click()
    setShowActions(false)
  }

  const handleRemove = () => {
    onRemove?.()
    setShowActions(false)
  }

  const handleView = () => {
    onView?.()
    setShowActions(false)
  }

  // Size mappings for touch targets
  const getSizeClasses = () => {
    if (!isTouchDevice) return ''
    
    switch (size) {
      case 'xs': return 'min-w-10 min-h-10'
      case 'sm': return 'min-w-12 min-h-12'
      case 'md': return 'min-w-16 min-h-16'
      case 'lg': return 'min-w-20 min-h-20'
      case 'xl': return 'min-w-24 min-h-24'
      case '2xl': return 'min-w-32 min-h-32'
      default: return 'min-w-20 min-h-20'
    }
  }

  const getActionButtonSize = () => {
    if (isMobile) {
      switch (size) {
        case 'xs':
        case 'sm': return 'w-8 h-8'
        case 'md':
        case 'lg': return 'w-10 h-10'
        case 'xl':
        case '2xl': return 'w-12 h-12'
        default: return 'w-10 h-10'
      }
    }
    return 'w-8 h-8'
  }

  const getActionButtonIconSize = () => {
    if (isMobile) {
      switch (size) {
        case 'xs':
        case 'sm': return 'h-4 w-4'
        case 'md':
        case 'lg': return 'h-5 w-5'
        case 'xl':
        case '2xl': return 'h-6 w-6'
        default: return 'h-5 w-5'
      }
    }
    return 'h-4 w-4'
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Hidden file input */}
      <input
        ref={setFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload avatar image"
      />

      {/* Avatar with touch interactions */}
      <div
        className={`relative ${getSizeClasses()}`}
        onTouchStart={touchHandlers.onTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => isTouchDevice && editable && setShowActions(!showActions)}
      >
        <UserAvatar
          src={src}
          firstName={firstName}
          lastName={lastName}
          email={email}
          size={size}
        />

        {/* Quick action button for mobile */}
        {editable && isTouchDevice && !showActions && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (isMobile) {
                setShowActions(true)
              } else {
                triggerFileUpload()
              }
            }}
            className={`
              absolute bottom-0 right-0 bg-primary-600 text-white rounded-full 
              shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-primary-500 transition-colors
              ${getActionButtonSize()}
              flex items-center justify-center
            `}
            aria-label="Edit avatar"
          >
            <CameraIcon className={getActionButtonIconSize()} />
          </button>
        )}
      </div>

      {/* Action menu for mobile */}
      {showActions && isTouchDevice && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48">
            {/* Upload option */}
            <button
              type="button"
              onClick={triggerFileUpload}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
            >
              <CameraIcon className="h-5 w-5 text-gray-400" />
              <span>Upload new photo</span>
            </button>

            {/* View option */}
            {src && onView && (
              <button
                type="button"
                onClick={handleView}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                <EyeIcon className="h-5 w-5 text-gray-400" />
                <span>View full size</span>
              </button>
            )}

            {/* Remove option */}
            {src && onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-600"
              >
                <TrashIcon className="h-5 w-5 text-red-400" />
                <span>Remove photo</span>
              </button>
            )}

            {/* Cancel option */}
            <button
              type="button"
              onClick={() => setShowActions(false)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-center text-gray-500 border-t border-gray-100 mt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowActions(false)}
          aria-hidden="true"
        />
      )}

      {/* Long press hint for mobile */}
      {isTouchDevice && editable && !showActions && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <p className="text-xs text-gray-500 whitespace-nowrap">
            Tap to edit
          </p>
        </div>
      )}
    </div>
  )
}

// Full-screen avatar viewer for mobile
interface AvatarViewerProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export function AvatarViewer({ src, alt, isOpen, onClose }: AvatarViewerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-2"
        aria-label="Close viewer"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        onClick={onClose}
      />

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-75">Tap anywhere to close</p>
      </div>
    </div>
  )
}