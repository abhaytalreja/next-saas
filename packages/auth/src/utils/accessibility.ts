'use client'

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g)
    if (!rgb) return 0
    
    const [r, g, b] = rgb.map(val => {
      const channel = parseInt(val) / 255
      return channel <= 0.03928 
        ? channel / 12.92 
        : Math.pow((channel + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

export function meetsWCAGContrast(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background)
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7
  }
  
  return size === 'large' ? ratio >= 3 : ratio >= 4.5
}

// Focus management utilities
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    if (event.key === 'Escape') {
      const closeButton = container.querySelector<HTMLElement>('[data-close]')
      if (closeButton) {
        closeButton.click()
      }
    }
  }
  
  container.addEventListener('keydown', handleKeyDown)
  firstElement?.focus()
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

// ARIA utilities
export function generateId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

export function announceToScreenReader(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Keyboard navigation utilities
export function handleRovingTabIndex(
  container: HTMLElement,
  itemSelector: string,
  orientation: 'horizontal' | 'vertical' | 'both' = 'vertical'
): () => void {
  const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector))
  
  // Set initial tabindex
  items.forEach((item, index) => {
    item.tabIndex = index === 0 ? 0 : -1
  })
  
  const getCurrentIndex = (): number => {
    return items.findIndex(item => item === document.activeElement)
  }
  
  const focusItem = (index: number): void => {
    if (index < 0 || index >= items.length) return
    
    items.forEach((item, i) => {
      item.tabIndex = i === index ? 0 : -1
    })
    
    items[index].focus()
  }
  
  const handleKeyDown = (event: KeyboardEvent): void => {
    const currentIndex = getCurrentIndex()
    if (currentIndex === -1) return
    
    let newIndex = currentIndex
    
    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault()
          newIndex = (currentIndex + 1) % items.length
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault()
          newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
        }
        break
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          newIndex = (currentIndex + 1) % items.length
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
        }
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break
    }
    
    if (newIndex !== currentIndex) {
      focusItem(newIndex)
    }
  }
  
  container.addEventListener('keydown', handleKeyDown)
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

// Screen reader utilities
export function hideFromScreenReader(element: HTMLElement): void {
  element.setAttribute('aria-hidden', 'true')
}

export function showToScreenReader(element: HTMLElement): void {
  element.removeAttribute('aria-hidden')
}

export function setScreenReaderLabel(element: HTMLElement, label: string): void {
  element.setAttribute('aria-label', label)
}

export function associateWithDescription(
  element: HTMLElement, 
  descriptionId: string
): void {
  const existingDescribedBy = element.getAttribute('aria-describedby')
  const describedBy = existingDescribedBy 
    ? `${existingDescribedBy} ${descriptionId}`
    : descriptionId
  
  element.setAttribute('aria-describedby', describedBy)
}

// Touch target utilities
export function ensureMinimumTouchTarget(element: HTMLElement): void {
  const styles = window.getComputedStyle(element)
  const width = parseInt(styles.width)
  const height = parseInt(styles.height)
  
  const minSize = 44 // 44px minimum touch target size
  
  if (width < minSize) {
    element.style.minWidth = `${minSize}px`
  }
  
  if (height < minSize) {
    element.style.minHeight = `${minSize}px`
  }
}

// Motion preferences
export function respectsReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function applyMotionPreferences(element: HTMLElement): void {
  if (respectsReducedMotion()) {
    element.style.animation = 'none'
    element.style.transition = 'none'
  }
}

// High contrast mode detection
export function isHighContrastMode(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}

// Reduced data mode detection
export function isReducedDataMode(): boolean {
  return 'connection' in navigator && 
         (navigator as any).connection?.saveData === true
}

export default {
  getContrastRatio,
  meetsWCAGContrast,
  trapFocus,
  generateId,
  announceToScreenReader,
  handleRovingTabIndex,
  hideFromScreenReader,
  showToScreenReader,
  setScreenReaderLabel,
  associateWithDescription,
  ensureMinimumTouchTarget,
  respectsReducedMotion,
  applyMotionPreferences,
  isHighContrastMode,
  isReducedDataMode
}