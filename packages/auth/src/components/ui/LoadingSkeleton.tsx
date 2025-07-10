'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
  animate?: boolean
}

export function Skeleton({ 
  className = '', 
  width, 
  height, 
  rounded = false, 
  animate = true 
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      className={`
        bg-gray-200 
        ${animate ? 'animate-pulse' : ''} 
        ${rounded ? 'rounded-full' : 'rounded'} 
        ${className}
      `}
      style={style}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
      tabIndex={-1}
    />
  )
}

// Avatar skeleton
export function AvatarSkeleton({ 
  size = 40, 
  className = '' 
}: { 
  size?: number
  className?: string 
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      rounded
      className={className}
    />
  )
}

// Profile form skeleton
export function ProfileFormSkeleton() {
  return (
    <div 
      className="space-y-6" 
      role="status" 
      aria-label="Loading profile form"
      aria-live="polite"
    >
      {/* Avatar section */}
      <div className="flex items-center space-x-4">
        <AvatarSkeleton size={80} />
        <div className="space-y-2">
          <Skeleton width={120} height={20} />
          <Skeleton width={200} height={16} />
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton width={100} height={16} />
            <Skeleton width="100%" height={40} />
          </div>
        ))}
      </div>

      {/* Bio field */}
      <div className="space-y-2">
        <Skeleton width={80} height={16} />
        <Skeleton width="100%" height={80} />
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <Skeleton width={120} height={40} />
      </div>
    </div>
  )
}

// Directory skeleton
export function DirectorySkeleton({ count = 9 }: { count?: number }) {
  return (
    <div 
      className="space-y-6" 
      role="status" 
      aria-label="Loading organization directory"
      aria-live="polite"
    >
      {/* Search and filters */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Skeleton width="100%" height={40} className="flex-1" />
          <Skeleton width={100} height={40} />
        </div>
      </div>

      {/* Results count */}
      <Skeleton width={200} height={20} />

      {/* Directory grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            {/* Header with avatar and info */}
            <div className="flex items-start space-x-3">
              <AvatarSkeleton size={48} />
              <div className="flex-1 space-y-2">
                <Skeleton width="80%" height={16} />
                <Skeleton width="60%" height={14} />
                <Skeleton width="40%" height={14} />
              </div>
              <Skeleton width={60} height={24} rounded />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <Skeleton width="100%" height={14} />
              <Skeleton width="80%" height={14} />
            </div>

            {/* Contact info */}
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center space-x-2">
                  <Skeleton width={16} height={16} />
                  <Skeleton width="70%" height={14} />
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} width={60} height={20} rounded />
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between">
              <Skeleton width={80} height={12} />
              <Skeleton width={100} height={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Activity dashboard skeleton
export function ActivitySkeleton() {
  return (
    <div 
      className="space-y-6" 
      role="status" 
      aria-label="Loading activity dashboard"
      aria-live="polite"
    >
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton width={100} height={16} />
              <Skeleton width={24} height={24} />
            </div>
            <Skeleton width={60} height={24} />
            <Skeleton width={120} height={12} />
          </div>
        ))}
      </div>

      {/* Activity list */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <Skeleton width={150} height={20} />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center space-x-3">
              <Skeleton width={32} height={32} rounded />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton width="60%" height={16} />
                  <Skeleton width={80} height={14} />
                </div>
                <Skeleton width="40%" height={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Organization profile skeleton
export function OrganizationProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton width={200} height={24} />
        <Skeleton width="80%" height={16} />
      </div>

      {/* Basic info section */}
      <div className="space-y-4">
        <Skeleton width={150} height={20} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton width={100} height={16} />
              <Skeleton width="100%" height={40} />
            </div>
          ))}
        </div>
      </div>

      {/* Skills section */}
      <div className="space-y-4">
        <Skeleton width={120} height={20} />
        <div className="space-y-3">
          <Skeleton width={80} height={16} />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width={80} height={24} rounded />
            ))}
          </div>
          <Skeleton width="100%" height={40} />
        </div>
      </div>

      {/* Privacy section */}
      <div className="space-y-4">
        <Skeleton width={120} height={20} />
        <div className="space-y-2">
          <Skeleton width={120} height={16} />
          <Skeleton width="100%" height={40} />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <Skeleton width={80} height={40} />
        <Skeleton width={120} height={40} />
      </div>
    </div>
  )
}

// Generic card skeleton
export function CardSkeleton({ 
  lines = 3, 
  hasHeader = true, 
  hasFooter = false 
}: { 
  lines?: number
  hasHeader?: boolean
  hasFooter?: boolean 
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {hasHeader && (
        <div className="space-y-2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="80%" height={16} />
        </div>
      )}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            width={i === lines - 1 ? "70%" : "100%"} 
            height={16} 
          />
        ))}
      </div>

      {hasFooter && (
        <div className="pt-2 border-t">
          <Skeleton width="40%" height={14} />
        </div>
      )}
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number
  columns?: number 
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b bg-gray-50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} width="60%" height={16} />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} width="80%" height={16} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Shimmer effect for more advanced loading
export function ShimmerSkeleton({ 
  className = '',
  width,
  height,
  rounded = false 
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      className={`
        relative overflow-hidden bg-gray-200
        ${rounded ? 'rounded-full' : 'rounded'} 
        ${className}
      `}
      style={style}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
      tabIndex={-1}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer" />
    </div>
  )
}