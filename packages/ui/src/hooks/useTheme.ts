import React, { useContext, useEffect, useState, useMemo } from 'react'

export type Theme = 'hubspot' | 'real-estate' | 'crypto' | 'healthcare' | 'ecommerce'
export type ColorMode = 'light' | 'dark' | 'system'

interface ThemeConfig {
  theme: Theme
  colorMode: ColorMode
  systemColorMode: 'light' | 'dark'
}

interface ThemeContextType extends ThemeConfig {
  setTheme: (theme: Theme) => void
  setColorMode: (mode: ColorMode) => void
  toggleColorMode: () => void
  resolvedColorMode: 'light' | 'dark'
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function useSystemColorMode(): 'light' | 'dark' {
  const [systemColorMode, setSystemColorMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateSystemColorMode = () => {
      setSystemColorMode(mediaQuery.matches ? 'dark' : 'light')
    }

    // Set initial value
    updateSystemColorMode()

    // Listen for changes
    mediaQuery.addEventListener('change', updateSystemColorMode)

    return () => {
      mediaQuery.removeEventListener('change', updateSystemColorMode)
    }
  }, [])

  return systemColorMode
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export function useColorMode(): {
  colorMode: ColorMode
  setColorMode: (mode: ColorMode) => void
  toggleColorMode: () => void
  resolvedColorMode: 'light' | 'dark'
} {
  const [colorMode, setColorMode] = useLocalStorage<ColorMode>('nextsaas-color-mode', 'system')
  const systemColorMode = useSystemColorMode()

  const resolvedColorMode = colorMode === 'system' ? systemColorMode : colorMode

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedColorMode)
    root.setAttribute('data-color-mode', resolvedColorMode)
  }, [resolvedColorMode])

  const toggleColorMode = () => {
    setColorMode(prev => {
      switch (prev) {
        case 'light':
          return 'dark'
        case 'dark':
          return 'system'
        case 'system':
          return 'light'
        default:
          return 'light'
      }
    })
  }

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
    resolvedColorMode,
  }
}

export function useThemeClass(theme: Theme): string {
  return `theme-${theme}`
}

export function useThemeVariables(theme: Theme, colorMode: 'light' | 'dark') {
  return useMemo(() => {
    // This would generate CSS custom properties based on the theme
    // For now, return the theme class
    return `theme-${theme} ${colorMode}`
  }, [theme, colorMode])
}

// Utility hook to detect theme preference from user agent or saved preference
export function usePreferredTheme(): Theme {
  const [preferredTheme, setPreferredTheme] = useLocalStorage<Theme>('nextsaas-preferred-theme', 'hubspot')
  
  useEffect(() => {
    // You could add logic here to detect theme preference based on:
    // - User agent
    // - Geographic location
    // - Industry detection
    // - A/B testing
    
    // For now, return the saved preference or default to hubspot
  }, [])

  return preferredTheme
}