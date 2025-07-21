'use client'

import { useCallback, useEffect, RefObject } from 'react'

interface KeyboardNavigationOptions {
  onEscape?: () => void
  onEnter?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onHome?: () => void
  onEnd?: () => void
  onTab?: (event: KeyboardEvent) => void
  preventDefault?: string[]
  enabled?: boolean
}

export function useKeyboardNavigation(
  elementRef: RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    onTab,
    preventDefault = [],
    enabled = true
  } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const { key } = event

    // Prevent default for specified keys
    if (preventDefault.includes(key)) {
      event.preventDefault()
    }

    switch (key) {
      case 'Escape':
        onEscape?.()
        break
      case 'Enter':
        onEnter?.()
        break
      case 'ArrowUp':
        onArrowUp?.()
        break
      case 'ArrowDown':
        onArrowDown?.()
        break
      case 'ArrowLeft':
        onArrowLeft?.()
        break
      case 'ArrowRight':
        onArrowRight?.()
        break
      case 'Home':
        onHome?.()
        break
      case 'End':
        onEnd?.()
        break
      case 'Tab':
        onTab?.(event)
        break
    }
  }, [
    enabled,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    onTab,
    preventDefault
  ])

  useEffect(() => {
    const element = elementRef.current
    if (!element || !enabled) return

    element.addEventListener('keydown', handleKeyDown)
    return () => element.removeEventListener('keydown', handleKeyDown)
  }, [elementRef, handleKeyDown, enabled])

  return { handleKeyDown }
}

// Helper for roving tabindex pattern
export function useRovingTabIndex(
  containerRef: RefObject<HTMLElement>,
  itemSelector: string = '[role="option"], [role="menuitem"], [role="tab"]',
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both'
    wrap?: boolean
    enabled?: boolean
  } = {}
) {
  const { orientation = 'vertical', wrap = true, enabled = true } = options

  const getCurrentIndex = useCallback(() => {
    if (!containerRef.current) return -1
    const items = Array.from(containerRef.current.querySelectorAll(itemSelector))
    const activeElement = document.activeElement
    return items.findIndex(item => item === activeElement)
  }, [containerRef, itemSelector])

  const focusItem = useCallback((index: number) => {
    if (!containerRef.current) return
    const items = Array.from(containerRef.current.querySelectorAll<HTMLElement>(itemSelector))
    const item = items[index]
    if (item) {
      // Update tabindex
      items.forEach((item, i) => {
        item.tabIndex = i === index ? 0 : -1
      })
      item.focus()
    }
  }, [containerRef, itemSelector])

  const moveToNext = useCallback(() => {
    if (!containerRef.current) return
    const items = Array.from(containerRef.current.querySelectorAll(itemSelector))
    const currentIndex = getCurrentIndex()
    const nextIndex = currentIndex === items.length - 1 
      ? (wrap ? 0 : currentIndex)
      : currentIndex + 1
    focusItem(nextIndex)
  }, [containerRef, itemSelector, getCurrentIndex, focusItem, wrap])

  const moveToPrevious = useCallback(() => {
    if (!containerRef.current) return
    const items = Array.from(containerRef.current.querySelectorAll(itemSelector))
    const currentIndex = getCurrentIndex()
    const prevIndex = currentIndex === 0 
      ? (wrap ? items.length - 1 : 0)
      : currentIndex - 1
    focusItem(prevIndex)
  }, [containerRef, itemSelector, getCurrentIndex, focusItem, wrap])

  const moveToFirst = useCallback(() => {
    focusItem(0)
  }, [focusItem])

  const moveToLast = useCallback(() => {
    if (!containerRef.current) return
    const items = Array.from(containerRef.current.querySelectorAll(itemSelector))
    focusItem(items.length - 1)
  }, [containerRef, itemSelector, focusItem])

  useKeyboardNavigation(containerRef, {
    onArrowDown: orientation === 'vertical' || orientation === 'both' ? moveToNext : undefined,
    onArrowUp: orientation === 'vertical' || orientation === 'both' ? moveToPrevious : undefined,
    onArrowRight: orientation === 'horizontal' || orientation === 'both' ? moveToNext : undefined,
    onArrowLeft: orientation === 'horizontal' || orientation === 'both' ? moveToPrevious : undefined,
    onHome: moveToFirst,
    onEnd: moveToLast,
    preventDefault: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'],
    enabled
  })

  return {
    getCurrentIndex,
    focusItem,
    moveToNext,
    moveToPrevious,
    moveToFirst,
    moveToLast
  }
}