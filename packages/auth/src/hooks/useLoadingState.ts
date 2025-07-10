'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface LoadingState {
  [key: string]: boolean
}

interface LoadingError {
  [key: string]: string | null
}

interface UseLoadingStateReturn {
  isLoading: (key?: string) => boolean
  error: (key?: string) => string | null
  startLoading: (key?: string) => void
  stopLoading: (key?: string) => void
  setError: (error: string | null, key?: string) => void
  clearError: (key?: string) => void
  withLoading: <T>(
    asyncFn: () => Promise<T>,
    key?: string,
    options?: {
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
      errorMessage?: string
    }
  ) => Promise<T | null>
  reset: (key?: string) => void
  hasAnyLoading: () => boolean
  hasAnyErrors: () => boolean
}

const DEFAULT_KEY = 'default'

export function useLoadingState(): UseLoadingStateReturn {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})
  const [errors, setErrors] = useState<LoadingError>({})
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const isLoading = useCallback((key: string = DEFAULT_KEY): boolean => {
    return loadingStates[key] || false
  }, [loadingStates])

  const error = useCallback((key: string = DEFAULT_KEY): string | null => {
    return errors[key] || null
  }, [errors])

  const startLoading = useCallback((key: string = DEFAULT_KEY) => {
    if (!mountedRef.current) return
    setLoadingStates(prev => ({ ...prev, [key]: true }))
    // Clear any existing error when starting loading
    setErrors(prev => ({ ...prev, [key]: null }))
  }, [])

  const stopLoading = useCallback((key: string = DEFAULT_KEY) => {
    if (!mountedRef.current) return
    setLoadingStates(prev => ({ ...prev, [key]: false }))
  }, [])

  const setError = useCallback((errorMessage: string | null, key: string = DEFAULT_KEY) => {
    if (!mountedRef.current) return
    setErrors(prev => ({ ...prev, [key]: errorMessage }))
    // Stop loading when setting an error
    setLoadingStates(prev => ({ ...prev, [key]: false }))
  }, [])

  const clearError = useCallback((key: string = DEFAULT_KEY) => {
    if (!mountedRef.current) return
    setErrors(prev => ({ ...prev, [key]: null }))
  }, [])

  const withLoading = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      key: string = DEFAULT_KEY,
      options: {
        onSuccess?: (result: T) => void
        onError?: (error: Error) => void
        errorMessage?: string
      } = {}
    ): Promise<T | null> => {
      const { onSuccess, onError, errorMessage } = options

      try {
        startLoading(key)
        const result = await asyncFn()
        
        if (mountedRef.current) {
          stopLoading(key)
          onSuccess?.(result)
        }
        
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        
        if (mountedRef.current) {
          setError(errorMessage || error.message, key)
          onError?.(error)
        }
        
        return null
      }
    },
    [startLoading, stopLoading, setError]
  )

  const reset = useCallback((key?: string) => {
    if (!mountedRef.current) return
    
    if (key) {
      setLoadingStates(prev => ({ ...prev, [key]: false }))
      setErrors(prev => ({ ...prev, [key]: null }))
    } else {
      setLoadingStates({})
      setErrors({})
    }
  }, [])

  const hasAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some(loading => loading)
  }, [loadingStates])

  const hasAnyErrors = useCallback((): boolean => {
    return Object.values(errors).some(error => error !== null)
  }, [errors])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError,
    clearError,
    withLoading,
    reset,
    hasAnyLoading,
    hasAnyErrors
  }
}

// Specialized hook for form loading states
export function useFormLoadingState() {
  const loadingState = useLoadingState()

  const submitWithLoading = useCallback(
    async <T>(
      submitFn: () => Promise<T>,
      options?: {
        onSuccess?: (result: T) => void
        onError?: (error: Error) => void
        successMessage?: string
        errorMessage?: string
      }
    ): Promise<T | null> => {
      return loadingState.withLoading(
        submitFn,
        'submit',
        {
          onSuccess: (result) => {
            options?.onSuccess?.(result)
            if (options?.successMessage) {
              // Toast would be handled by the calling component
            }
          },
          onError: options?.onError,
          errorMessage: options?.errorMessage || 'Failed to submit form'
        }
      )
    },
    [loadingState]
  )

  return {
    ...loadingState,
    isSubmitting: () => loadingState.isLoading('submit'),
    submitError: () => loadingState.error('submit'),
    submitWithLoading
  }
}

// Hook for managing multiple async operations
export function useAsyncOperations() {
  const loadingState = useLoadingState()

  const executeOperation = useCallback(
    async <T>(
      operationName: string,
      asyncFn: () => Promise<T>,
      options?: {
        onSuccess?: (result: T) => void
        onError?: (error: Error) => void
        errorMessage?: string
      }
    ): Promise<T | null> => {
      return loadingState.withLoading(asyncFn, operationName, options)
    },
    [loadingState]
  )

  return {
    ...loadingState,
    executeOperation,
    isOperationLoading: (operationName: string) => loadingState.isLoading(operationName),
    getOperationError: (operationName: string) => loadingState.error(operationName)
  }
}