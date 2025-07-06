'use client'

import { useContext } from 'react'
import { AuthContext } from '../providers/AuthProvider'
import type { AuthContextValue } from '../types'

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth()
  return !loading && !!user
}

/**
 * Hook to get the current user
 */
export function useUser() {
  const { user, loading } = useAuth()
  return { user, loading }
}

/**
 * Hook to get authentication loading state
 */
export function useAuthLoading(): boolean {
  const { loading } = useAuth()
  return loading
}

/**
 * Hook to get authentication error
 */
export function useAuthError() {
  const { error } = useAuth()
  return error
}
