'use client'

import { useState, useEffect } from 'react'

interface MobileDetectionResult {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  orientation: 'portrait' | 'landscape'
  platform: 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'unknown'
}

export function useMobileDetection(): MobileDetectionResult {
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenSize: 'lg',
    orientation: 'landscape',
    platform: 'unknown'
  })

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent.toLowerCase()

      // Screen size detection
      let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'lg'
      if (width < 640) screenSize = 'xs'
      else if (width < 768) screenSize = 'sm'
      else if (width < 1024) screenSize = 'md'
      else if (width < 1280) screenSize = 'lg'
      else if (width < 1536) screenSize = 'xl'
      else screenSize = '2xl'

      // Device type detection
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      // Touch device detection
      const isTouchDevice = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 ||
                           'msMaxTouchPoints' in navigator

      // Orientation detection
      const orientation = height > width ? 'portrait' : 'landscape'

      // Platform detection
      let platform: 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'unknown' = 'unknown'
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        platform = 'ios'
      } else if (userAgent.includes('android')) {
        platform = 'android'
      } else if (userAgent.includes('windows')) {
        platform = 'windows'
      } else if (userAgent.includes('mac')) {
        platform = 'mac'
      } else if (userAgent.includes('linux')) {
        platform = 'linux'
      }

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenSize,
        orientation,
        platform
      })
    }

    // Initial detection
    updateDetection()

    // Listen for resize and orientation changes
    window.addEventListener('resize', updateDetection)
    window.addEventListener('orientationchange', updateDetection)

    return () => {
      window.removeEventListener('resize', updateDetection)
      window.removeEventListener('orientationchange', updateDetection)
    }
  }, [])

  return detection
}

// Hook for responsive breakpoints
export function useBreakpoint() {
  const { screenSize } = useMobileDetection()
  
  return {
    isXs: screenSize === 'xs',
    isSm: screenSize === 'sm',
    isMd: screenSize === 'md',
    isLg: screenSize === 'lg',
    isXl: screenSize === 'xl',
    is2Xl: screenSize === '2xl',
    isMobileOrTablet: ['xs', 'sm', 'md'].includes(screenSize),
    isDesktopOrLarger: ['lg', 'xl', '2xl'].includes(screenSize)
  }
}

// Hook for touch interactions
export function useTouchInteractions() {
  const { isTouchDevice, platform } = useMobileDetection()
  
  const [isLongPress, setIsLongPress] = useState(false)
  const [touchStartTime, setTouchStartTime] = useState(0)
  
  const handleTouchStart = () => {
    setTouchStartTime(Date.now())
    setIsLongPress(false)
  }
  
  const handleTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTime
    if (touchDuration > 500) {
      setIsLongPress(true)
    }
  }
  
  return {
    isTouchDevice,
    platform,
    isLongPress,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd
    }
  }
}