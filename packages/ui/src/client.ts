'use client'

// Client-side components that use React hooks
export * from './components/language-selector'
export * from './components/language-selector-app'
export * from './components/theme-switcher'

// Export the correct ThemeProvider and useTheme that ThemeSwitcher expects
export { ThemeProvider, useTheme } from './contexts/theme-context'

// New providers - renamed to avoid conflicts
export {
  ThemeProvider as NewThemeProvider,
  useTheme as useNewTheme,
} from './providers/theme-provider'
