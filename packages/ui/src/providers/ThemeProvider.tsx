import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocalStorage, useSystemColorMode } from '../hooks/useTheme'

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

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorMode?: ColorMode
  enableSystem?: boolean
  storageKey?: string
  attribute?: string
  value?: {
    light: string
    dark: string
  }
}

export function ThemeProvider({
  children,
  defaultTheme = 'hubspot',
  defaultColorMode = 'system',
  enableSystem = true,
  storageKey = 'nextsaas-theme',
  attribute = 'data-theme',
  value,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<Theme>(`${storageKey}-variant`, defaultTheme)
  const [colorMode, setColorMode] = useLocalStorage<ColorMode>(`${storageKey}-mode`, defaultColorMode)
  const systemColorMode = useSystemColorMode()

  const resolvedColorMode = colorMode === 'system' ? systemColorMode : colorMode

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme classes
    root.classList.remove('theme-hubspot', 'theme-real-estate', 'theme-crypto', 'theme-healthcare', 'theme-ecommerce')
    
    // Remove color mode classes
    root.classList.remove('light', 'dark')
    
    // Add current theme class
    root.classList.add(`theme-${theme}`)
    
    // Add current color mode class
    root.classList.add(resolvedColorMode)
    
    // Set attributes
    root.setAttribute(attribute, theme)
    root.setAttribute('data-color-mode', resolvedColorMode)
    
    if (value) {
      root.setAttribute('data-theme-value', value[resolvedColorMode])
    }
  }, [theme, resolvedColorMode, attribute, value])

  const toggleColorMode = () => {
    setColorMode(prev => {
      if (!enableSystem) {
        return prev === 'light' ? 'dark' : 'light'
      }
      
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

  const contextValue: ThemeContextType = {
    theme,
    colorMode,
    systemColorMode,
    setTheme,
    setColorMode,
    toggleColorMode,
    resolvedColorMode,
  }

  return (
    <ThemeContext.Provider value={contextValue} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to get theme-specific values
export function useThemeValue<T>(values: Record<Theme, T>): T {
  const { theme } = useTheme()
  return values[theme]
}

// Hook to get color-mode-specific values
export function useColorModeValue<T>(light: T, dark: T): T {
  const { resolvedColorMode } = useTheme()
  return resolvedColorMode === 'light' ? light : dark
}

// Hook to apply theme-specific CSS variables
export function useThemeCSS(): Record<string, string> {
  const { theme, resolvedColorMode } = useTheme()
  
  return React.useMemo(() => {
    // This would be generated from design tokens
    const cssVariables: Record<string, string> = {}
    
    // Example theme-specific variables
    switch (theme) {
      case 'hubspot':
        cssVariables['--primary-h'] = '24'
        cssVariables['--primary-s'] = '85%'
        cssVariables['--primary-l'] = '53%'
        break
      case 'real-estate':
        cssVariables['--primary-h'] = '199'
        cssVariables['--primary-s'] = '89%'
        cssVariables['--primary-l'] = '48%'
        break
      case 'crypto':
        cssVariables['--primary-h'] = '271'
        cssVariables['--primary-s'] = '91%'
        cssVariables['--primary-l'] = '65%'
        break
      // Add more themes...
    }
    
    // Color mode specific adjustments
    if (resolvedColorMode === 'dark') {
      cssVariables['--background'] = '222 84% 4.9%'
      cssVariables['--foreground'] = '210 40% 98%'
    } else {
      cssVariables['--background'] = '0 0% 100%'
      cssVariables['--foreground'] = '222.2 84% 4.9%'
    }
    
    return cssVariables
  }, [theme, resolvedColorMode])
}

// Component to inject theme CSS variables
export function ThemeStyleInjector() {
  const cssVariables = useThemeCSS()
  
  const cssString = Object.entries(cssVariables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ')
  
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root {\n  ${cssString}\n}`,
      }}
    />
  )
}