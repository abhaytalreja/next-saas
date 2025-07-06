'use client'

// Client-side components that use React hooks
export * from './components/language-selector'
export * from './components/language-selector-app'
export * from './components/theme-switcher'

// Legacy theme context - renamed exports
export {
  ThemeProvider as LegacyThemeProvider,
  useTheme as useLegacyTheme,
} from './contexts/theme-context'

// New providers
export * from './providers/theme-provider'
