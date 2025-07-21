'use client'

import { useRef, useCallback, useEffect } from 'react'

interface FocusableElement extends HTMLElement {
  focus(): void
}

export function useFocusManagement() {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const trapRef = useRef<HTMLElement | null>(null)

  // Store current focus to restore later
  const storeFocus = useCallback(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement
  }, [])

  // Restore previously stored focus
  const restoreFocus = useCallback(() => {
    if (previouslyFocusedRef.current && document.contains(previouslyFocusedRef.current)) {
      previouslyFocusedRef.current.focus()
      previouslyFocusedRef.current = null
    }
  }, [])

  // Set focus on specific element
  const setFocus = useCallback((element: HTMLElement | string) => {
    if (typeof element === 'string') {
      const target = document.getElementById(element) || document.querySelector(element)
      if (target) {
        ;(target as HTMLElement).focus()
      }
    } else {
      element.focus()
    }
  }, [])

  // Focus first focusable element in container
  const focusFirst = useCallback((container?: HTMLElement) => {
    const target = container || document.body
    const focusable = target.querySelector<FocusableElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable) {
      focusable.focus()
    }
  }, [])

  // Get all focusable elements within a container
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(element => {
      return (
        !element.disabled &&
        !element.hasAttribute('aria-hidden') &&
        element.offsetHeight > 0
      )
    })
  }, [])

  // Focus trap for modals and dialogs
  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (!trapRef.current || event.key !== 'Tab') return

    const focusableElements = getFocusableElements(trapRef.current)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [getFocusableElements])

  // Set up focus trap
  const enableFocusTrap = useCallback((container: HTMLElement) => {
    trapRef.current = container
    document.addEventListener('keydown', trapFocus)
    
    // Focus first element
    focusFirst(container)
  }, [trapFocus, focusFirst])

  // Remove focus trap
  const disableFocusTrap = useCallback(() => {
    document.removeEventListener('keydown', trapFocus)
    trapRef.current = null
  }, [trapFocus])

  // Skip to content link handler
  const skipToContent = useCallback((contentId: string) => {
    const content = document.getElementById(contentId)
    if (content) {
      content.focus()
      content.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return {
    storeFocus,
    restoreFocus,
    setFocus,
    focusFirst,
    getFocusableElements,
    enableFocusTrap,
    disableFocusTrap,
    skipToContent
  }
}