'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { User, AlertCircle } from 'lucide-react'

interface OptimizedImageProps {
  src?: string | null
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackIcon?: React.ComponentType<{ className?: string }>
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  onLoad?: () => void
  onError?: () => void
  sizes?: string
  style?: React.CSSProperties
}

// Simple in-memory cache for loaded images
const imageCache = new Map<string, boolean>()
const loadingPromises = new Map<string, Promise<void>>()

// Image optimization helper
const getOptimizedSrc = (src: string, width?: number, quality = 75) => {
  if (!src) return src
  
  // If it's already optimized or is a data URL, return as-is
  if (src.includes('?') || src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }
  
  // Add optimization parameters
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  params.set('q', quality.toString())
  
  return `${src}?${params.toString()}`
}

// Preload image function
const preloadImage = (src: string): Promise<void> => {
  if (imageCache.has(src)) {
    return Promise.resolve()
  }
  
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!
  }
  
  const promise = new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      imageCache.set(src, true)
      loadingPromises.delete(src)
      resolve()
    }
    img.onerror = () => {
      loadingPromises.delete(src)
      reject(new Error(`Failed to load image: ${src}`))
    }
    img.src = src
  })
  
  loadingPromises.set(src, promise)
  return promise
}

export function OptimizedImage({
  src,
  alt,
  width = 40,
  height = 40,
  className = '',
  fallbackIcon: FallbackIcon = User,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  onLoad,
  onError,
  sizes,
  style,
  ...props
}: OptimizedImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [isInView, setIsInView] = useState(priority) // Load immediately if priority
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  const optimizedSrc = src ? getOptimizedSrc(src, width, quality) : null

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !optimizedSrc) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observerRef.current = observer

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, optimizedSrc])

  // Preload image when in view
  useEffect(() => {
    if (!isInView || !optimizedSrc) return

    if (imageCache.has(optimizedSrc)) {
      setImageState('loaded')
      return
    }

    preloadImage(optimizedSrc)
      .then(() => {
        setImageState('loaded')
        onLoad?.()
      })
      .catch(() => {
        setImageState('error')
        onError?.()
      })
  }, [isInView, optimizedSrc, onLoad, onError])

  const handleImageLoad = useCallback(() => {
    if (optimizedSrc) {
      imageCache.set(optimizedSrc, true)
    }
    setImageState('loaded')
    onLoad?.()
  }, [optimizedSrc, onLoad])

  const handleImageError = useCallback(() => {
    setImageState('error')
    onError?.()
  }, [onError])

  // Base container styles
  const containerClass = `relative inline-flex items-center justify-center bg-gray-100 overflow-hidden ${className}`
  const imageStyle = {
    width,
    height,
    ...style
  }

  // Show fallback if no src or error occurred
  if (!src || imageState === 'error') {
    return (
      <div 
        className={containerClass}
        style={imageStyle}
        role="img"
        aria-label={alt}
      >
        {imageState === 'error' ? (
          <AlertCircle className="w-1/2 h-1/2 text-gray-400" />
        ) : (
          <FallbackIcon className="w-1/2 h-1/2 text-gray-400" />
        )}
      </div>
    )
  }

  // Show loading placeholder
  if (!isInView || imageState === 'loading') {
    return (
      <div 
        ref={imgRef}
        className={containerClass}
        style={imageStyle}
        role="img"
        aria-label={`Loading ${alt}`}
      >
        {placeholder === 'blur' ? (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        ) : (
          <FallbackIcon className="w-1/2 h-1/2 text-gray-400 animate-pulse" />
        )}
      </div>
    )
  }

  // Show optimized image
  return (
    <div className={containerClass} style={imageStyle}>
      <img
        ref={imgRef}
        src={optimizedSrc!}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        decoding="async"
        {...props}
      />
    </div>
  )
}

// Avatar-specific optimized image component
interface OptimizedAvatarProps extends Omit<OptimizedImageProps, 'fallbackIcon'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  rounded?: boolean
  showOnlineStatus?: boolean
  isOnline?: boolean
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80
}

export function OptimizedAvatar({
  size = 'md',
  rounded = true,
  showOnlineStatus = false,
  isOnline = false,
  className = '',
  ...props
}: OptimizedAvatarProps) {
  const dimensions = typeof size === 'number' ? size : sizeMap[size]
  const roundedClass = rounded ? 'rounded-full' : 'rounded-lg'
  
  return (
    <div className="relative inline-block">
      <OptimizedImage
        {...props}
        width={dimensions}
        height={dimensions}
        className={`${roundedClass} ${className}`}
        fallbackIcon={User}
      />
      {showOnlineStatus && (
        <div 
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-400' : 'bg-gray-400'
          }`}
          aria-label={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  )
}

// Bulk image preloader for profile pages
export const preloadProfileImages = async (imageUrls: (string | null | undefined)[]): Promise<void> => {
  const validUrls = imageUrls.filter((url): url is string => Boolean(url))
  
  try {
    await Promise.allSettled(
      validUrls.map(url => preloadImage(getOptimizedSrc(url, 80, 75)))
    )
  } catch (error) {
    console.warn('Some profile images failed to preload:', error)
  }
}

// Clear image cache (useful for testing or memory management)
export const clearImageCache = (): void => {
  imageCache.clear()
  loadingPromises.clear()
}