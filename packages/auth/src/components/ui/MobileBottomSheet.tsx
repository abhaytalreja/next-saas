'use client'

import React, { useEffect, useRef } from 'react'
import { useMobileDetection } from '../../hooks/useMobileDetection'
import { useFocusManagement } from '../../hooks/useFocusManagement'

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  preventClose?: boolean
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  preventClose = false
}: MobileBottomSheetProps) {
  const { isMobileOrTablet } = useMobileDetection()
  const { enableFocusTrap, disableFocusTrap, storeFocus, restoreFocus } = useFocusManagement()
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const isDragging = useRef<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      storeFocus()
      document.body.style.overflow = 'hidden'
      
      if (sheetRef.current) {
        enableFocusTrap(sheetRef.current)
      }
    } else {
      document.body.style.overflow = ''
      disableFocusTrap()
      restoreFocus()
    }

    return () => {
      document.body.style.overflow = ''
      disableFocusTrap()
    }
  }, [isOpen, enableFocusTrap, disableFocusTrap, storeFocus, restoreFocus])

  // Touch handlers for swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    if (preventClose) return
    
    startY.current = e.touches[0].clientY
    isDragging.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || preventClose) return
    
    currentY.current = e.touches[0].clientY
    const deltaY = currentY.current - startY.current
    
    // Only allow downward swipe
    if (deltaY > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging.current || preventClose) return
    
    const deltaY = currentY.current - startY.current
    
    if (sheetRef.current) {
      if (deltaY > 100) {
        // Close if swiped down more than 100px
        onClose()
      } else {
        // Snap back to original position
        sheetRef.current.style.transform = 'translateY(0)'
      }
    }
    
    isDragging.current = false
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !preventClose) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, preventClose])

  if (!isOpen) return null

  // For desktop, render as a modal dialog
  if (!isMobileOrTablet) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={!preventClose ? onClose : undefined}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div
            ref={sheetRef}
            className={`relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {title && (
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
                {!preventClose && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-1"
                    aria-label="Close"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mobile bottom sheet
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={!preventClose ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`
          fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          max-h-[90vh] overflow-hidden
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sheet-title' : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        {!preventClose && (
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        
        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 id="sheet-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              {!preventClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-2"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// Hook for managing bottom sheet state
export function useBottomSheet() {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), [])
  
  return {
    isOpen,
    open,
    close,
    toggle
  }
}