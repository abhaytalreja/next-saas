'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getSessionManager } from '../lib/session-manager'
import type { AuthSession, SessionInfo } from '../types'

/**
 * Hook for session management
 */
export function useSession() {
  const { session, loading, error } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const sessionManager = getSessionManager()

  // Get extended session information
  useEffect(() => {
    if (session) {
      // Extract session info from the session object
      const info: SessionInfo = {
        id: session.access_token.substring(0, 8), // Use first 8 chars as ID
        userId: session.user.id,
        ipAddress: 'unknown', // Would need to be fetched from server
        userAgent: navigator.userAgent,
        current: true,
        lastActivity: new Date(),
        expiresAt: new Date(session.expires_at! * 1000),
        createdAt: new Date(session.user.created_at),
      }
      setSessionInfo(info)
    } else {
      setSessionInfo(null)
    }
  }, [session])

  // Force refresh session
  const refreshSession = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await sessionManager.forceRefresh()
    } catch (error) {
      console.error('Failed to refresh session:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [sessionManager, isRefreshing])

  // Get session time remaining
  const getTimeRemaining = useCallback(() => {
    if (!session?.expires_at) return 0

    const now = Math.floor(Date.now() / 1000)
    const remaining = session.expires_at - now
    return Math.max(0, remaining)
  }, [session?.expires_at])

  // Check if session is near expiry
  const isNearExpiry = useCallback(
    (threshold: number = 300) => {
      const remaining = getTimeRemaining()
      return remaining > 0 && remaining <= threshold
    },
    [getTimeRemaining]
  )

  // Check if session is expired
  const isExpired = useCallback(() => {
    return getTimeRemaining() <= 0
  }, [getTimeRemaining])

  return {
    session,
    sessionInfo,
    loading,
    error,
    isRefreshing,
    refreshSession,
    getTimeRemaining,
    isNearExpiry,
    isExpired,
  }
}

/**
 * Hook for session activity tracking
 */
export function useSessionActivity() {
  const { session } = useAuth()
  const [lastActivity, setLastActivity] = useState<Date>(new Date())

  // Update last activity on user interaction
  useEffect(() => {
    if (!session) return

    const updateActivity = () => {
      setLastActivity(new Date())
    }

    // Track various user interactions
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ]

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity)
      })
    }
  }, [session])

  // Check if user is idle
  const isIdle = useCallback(
    (threshold: number = 15 * 60 * 1000) => {
      const now = new Date().getTime()
      const lastActivityTime = lastActivity.getTime()
      return now - lastActivityTime > threshold
    },
    [lastActivity]
  )

  return {
    lastActivity,
    isIdle,
  }
}

/**
 * Hook for session timeout warning
 */
export function useSessionTimeout(warningThreshold: number = 5 * 60) {
  const { session } = useSession()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!session?.expires_at) return

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = session.expires_at! - now

      setTimeLeft(remaining)

      if (remaining <= warningThreshold && remaining > 0) {
        setShowWarning(true)
      } else {
        setShowWarning(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.expires_at, warningThreshold])

  const dismissWarning = useCallback(() => {
    setShowWarning(false)
  }, [])

  return {
    showWarning,
    timeLeft,
    dismissWarning,
  }
}
