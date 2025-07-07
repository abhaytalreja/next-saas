'use client'

import React, { useState } from 'react'
import { UserCircleIcon } from '@heroicons/react/24/solid'

interface UserAvatarProps {
  src?: string | null
  alt?: string
  firstName?: string
  lastName?: string
  email?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showStatus?: boolean
  status?: 'online' | 'offline' | 'away' | 'busy'
  onClick?: () => void
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const statusColors = {
  online: 'bg-green-400',
  offline: 'bg-gray-400',
  away: 'bg-yellow-400',
  busy: 'bg-red-400',
}

export function UserAvatar({
  src,
  alt,
  firstName,
  lastName,
  email,
  size = 'md',
  className = '',
  showStatus = false,
  status = 'online',
  onClick,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)

  // Generate initials
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Generate consistent color from name/email
  const getBackgroundColor = () => {
    const str = firstName || email || 'default'
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const avatarContent = src && !imageError ? (
    <img
      src={src}
      alt={alt || `${firstName} ${lastName}` || 'User avatar'}
      className={`${sizeClasses[size]} rounded-full object-cover`}
      onError={handleImageError}
    />
  ) : (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white`}
      style={{ backgroundColor: getBackgroundColor() }}
      aria-label={alt || `${firstName} ${lastName}` || 'User avatar'}
    >
      {getInitials()}
    </div>
  )

  const wrapperClasses = `relative inline-block ${className} ${onClick ? 'cursor-pointer' : ''}`

  return (
    <div 
      className={wrapperClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {avatarContent}
      
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${statusColors[status]}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}

interface UserAvatarGroupProps {
  users: Array<{
    id: string
    src?: string | null
    firstName?: string
    lastName?: string
    email?: string
  }>
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function UserAvatarGroup({
  users,
  max = 4,
  size = 'sm',
  className = '',
}: UserAvatarGroupProps) {
  const displayUsers = users.slice(0, max)
  const remainingCount = users.length - max

  return (
    <div className={`flex -space-x-2 overflow-hidden ${className}`}>
      {displayUsers.map((user) => (
        <UserAvatar
          key={user.id}
          src={user.src}
          firstName={user.firstName}
          lastName={user.lastName}
          email={user.email}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      
      {remainingCount > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-medium ring-2 ring-white`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}