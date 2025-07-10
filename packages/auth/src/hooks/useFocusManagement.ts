'use client'

import { useRef, useCallback, useEffect } from 'react'

interface FocusableElement extends HTMLElement {
  focus(): void
  blur(): void
}

export function useFocusManagement() {
  const previousFocusRef = useRef<FocusableElement | null>(null)
  const trapRef = useRef<HTMLElement | null>(null)

  // Store current focus before opening modal/dialog
  const storeFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as FocusableElement
  }, [])

  // Restore focus when closing modal/dialog
  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [])

  // Set focus to specific element
  const setFocus = useCallback((element: HTMLElement | null, delay = 0) => {
    if (!element) return

    if (delay > 0) {
      setTimeout(() => {
        element.focus()
      }, delay)
    } else {
      element.focus()
    }
  }, [])

  // Focus first focusable element in container
  const focusFirst = useCallback((container?: HTMLElement) => {
    const target = container || document.body
    const focusable = target.querySelector<FocusableElement>(\n      'button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])'\n    )\n    if (focusable) {\n      focusable.focus()\n    }\n  }, [])\n\n  // Get all focusable elements within a container\n  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {\n    return Array.from(\n      container.querySelectorAll<HTMLElement>(\n        'button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])'\n      )\n    ).filter(element => {\n      return (\n        !element.disabled &&\n        !element.hasAttribute('aria-hidden') &&\n        element.offsetHeight > 0\n      )\n    })\n  }, [])\n\n  // Focus trap for modals and dialogs\n  const trapFocus = useCallback((event: KeyboardEvent) => {\n    if (!trapRef.current || event.key !== 'Tab') return\n\n    const focusableElements = getFocusableElements(trapRef.current)\n    if (focusableElements.length === 0) return\n\n    const firstElement = focusableElements[0]\n    const lastElement = focusableElements[focusableElements.length - 1]\n\n    if (event.shiftKey) {\n      // Shift + Tab\n      if (document.activeElement === firstElement) {\n        event.preventDefault()\n        lastElement.focus()\n      }\n    } else {\n      // Tab\n      if (document.activeElement === lastElement) {\n        event.preventDefault()\n        firstElement.focus()\n      }\n    }\n  }, [getFocusableElements])\n\n  // Set up focus trap\n  const enableFocusTrap = useCallback((container: HTMLElement) => {\n    trapRef.current = container\n    document.addEventListener('keydown', trapFocus)\n    \n    // Focus first element\n    focusFirst(container)\n  }, [trapFocus, focusFirst])\n\n  // Remove focus trap\n  const disableFocusTrap = useCallback(() => {\n    document.removeEventListener('keydown', trapFocus)\n    trapRef.current = null\n  }, [trapFocus])\n\n  // Skip to content link handler\n  const skipToContent = useCallback((contentId: string) => {\n    const content = document.getElementById(contentId)\n    if (content) {\n      content.focus()\n      content.scrollIntoView({ behavior: 'smooth' })\n    }\n  }, [])\n\n  return {\n    storeFocus,\n    restoreFocus,\n    setFocus,\n    focusFirst,\n    getFocusableElements,\n    enableFocusTrap,\n    disableFocusTrap,\n    skipToContent\n  }\n}