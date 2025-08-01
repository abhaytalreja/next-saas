'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '../../../lib/utils'

export interface ToastOptions {
  id?: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
}

interface Toast extends ToastOptions {
  id: string
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider
export interface ToastProviderProps {
  children: React.ReactNode
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  maxToasts?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'bottom-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = options.id || Math.random().toString(36).substring(2, 9)
      const newToast: Toast = {
        ...options,
        id,
        duration: options.duration ?? 5000,
        dismissible: options.dismissible ?? true,
      }

      setToasts(prevToasts => {
        const updatedToasts = [...prevToasts, newToast]
        if (updatedToasts.length > maxToasts) {
          return updatedToasts.slice(-maxToasts)
        }
        return updatedToasts
      })

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, newToast.duration)
      }

      return id
    },
    [maxToasts]
  )

  const dismiss = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(t => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  const success = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, variant: 'success' })
    },
    [toast]
  )

  const error = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, variant: 'error' })
    },
    [toast]
  )

  const warning = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, variant: 'warning' })
    },
    [toast]
  )

  const info = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, variant: 'info' })
    },
    [toast]
  )

  const value = {
    toasts,
    toast,
    dismiss,
    dismissAll,
    success,
    error,
    warning,
    info,
  } as ToastContextValue

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// Toast Container
interface ToastContainerProps {
  toasts: Toast[]
  position: string
  onDismiss: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position,
  onDismiss,
}) => {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0',
  }

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 p-4 pointer-events-none',
        positionClasses[position as keyof typeof positionClasses]
      )}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// Individual Toast Item
interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
    success:
      'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200',
    warning:
      'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
  }

  const iconVariants = {
    default: null,
    success: (
      <svg
        className="h-5 w-5 text-green-600 dark:text-green-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg
        className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg
        className="h-5 w-5 text-red-600 dark:text-red-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg
        className="h-5 w-5 text-blue-600 dark:text-blue-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  }

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300',
        'animate-in slide-in-from-top-2 fade-in-0',
        variantClasses[toast.variant || 'default']
      )}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          {iconVariants[toast.variant || 'default'] && (
            <div className="flex-shrink-0">
              {iconVariants[toast.variant || 'default']}
            </div>
          )}
          <div
            className={cn(
              'flex-1',
              iconVariants[toast.variant || 'default'] && 'ml-3'
            )}
          >
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && (
              <p className="mt-1 text-sm opacity-90">{toast.description}</p>
            )}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm font-medium underline hover:no-underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          {toast.dismissible && (
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => onDismiss(toast.id)}
                className="inline-flex rounded-md text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simplified toast function for use without provider
let toastCount = 0

export const toast = {
  success: (title: string, description?: string) => {
    console.log('[Toast Success]', title, description)
  },
  error: (title: string, description?: string) => {
    console.log('[Toast Error]', title, description)
  },
  warning: (title: string, description?: string) => {
    console.log('[Toast Warning]', title, description)
  },
  info: (title: string, description?: string) => {
    console.log('[Toast Info]', title, description)
  },
  show: (options: ToastOptions) => {
    console.log('[Toast]', options)
  },
}
