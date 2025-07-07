// Core utilities
export { cn, getColor, getSpace, getFontSize, getShadow, getRadius } from './lib/utils'
export * from './utils/component-validator'

// Design Tokens
export { tokens as designTokens } from './design-tokens'
export {
  colors,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  elevation,
  focus,
  getTokenValue,
  generateCSSVariables,
} from './design-tokens'

// Atoms
export * from './atoms/buttons/Button'
export * from './atoms/inputs/Input'
export * from './atoms/typography/Heading'
export * from './atoms/typography/Text'
export * from './atoms/badges/Badge'
export * from './atoms/avatars/Avatar'
export * from './atoms/spinners/Spinner'
export * from './atoms/toggles/Switch'
export * from './atoms/icons/Icon'
export * from './atoms/skeletons/Skeleton'
export * from './atoms/dividers/Divider'

// New Components - Buttons
export * from './components/atoms/buttons/IconButton'

// New Components - Data Display
export * from './components/atoms/data-display/Tag'

// New Components - Layout
export * from './components/atoms/layout/Grid'
export * from './components/atoms/layout/Stack'
export * from './components/atoms/layout/Container'
export * from './components/atoms/layout/Section'

// New Components - Inputs
export * from './components/atoms/inputs/Select'
export * from './components/atoms/inputs/Checkbox'
export * from './components/atoms/inputs/Radio'
export * from './components/atoms/inputs/Textarea'

// New Components - Feedback
export * from './components/atoms/feedback/Progress'

// Molecules
export * from './molecules/cards/Card'
export * from './molecules/alerts/Alert'
export { FormField, FormSection } from './molecules/forms/FormField'
export type { FormFieldProps, FormSectionProps } from './molecules/forms/FormField'
export * from './molecules/search/SearchBox'
export * from './molecules/navigation/DropdownMenu'

// New Molecules - Forms
export * from './components/molecules/forms/Form'

// New Molecules - Navigation
export * from './components/molecules/navigation/Tabs'
export { 
  Breadcrumb, 
  CollapsibleBreadcrumb,
  type BreadcrumbProps,
  type CollapsibleBreadcrumbProps 
} from './components/molecules/navigation/Breadcrumb'
export * from './components/molecules/navigation/Pagination'

// New Molecules - Feedback
export * from './components/molecules/feedback/Tooltip'
export * from './components/molecules/feedback/Drawer'
export * from './components/molecules/feedback/Modal'
export * from './components/molecules/feedback/Toast'

// New Molecules - Data Display
export * from './components/molecules/data-display/Table'
export * from './components/molecules/data-display/List'
export * from './components/molecules/data-display/Stat'

// New Molecules - Navigation (Additional)
export * from './components/molecules/navigation/Navbar'
export { 
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarToggle,
  SidebarSeparator,
  useSidebar,
  type SidebarProps,
  type SidebarProviderProps,
  type SidebarHeaderProps,
  type SidebarContentProps,
  type SidebarFooterProps,
  type SidebarGroupProps,
  type SidebarToggleProps,
  type SidebarSeparatorProps,
  type SidebarItemProps
} from './components/molecules/navigation/Sidebar'
export * from './components/molecules/navigation/Menu'
export * from './components/molecules/navigation/ContextMenu'

// New Atoms - Navigation
export * from './components/atoms/navigation/Link'

// Molecules - Additional
export * from './molecules/data-display/DataTable'
export * from './molecules/inputs/DatePicker'
export * from './molecules/inputs/FileUploader'

// Organisms
export * from './organisms/navigation/Navigation'
export * from './organisms/layout/Header'
export * from './organisms/navigation/CommandPalette'
export * from './organisms/data-display/DataGrid'
export * from './organisms/feedback/NotificationCenter'
export * from './organisms/layout/Dashboard'

// Templates
export * from './templates/layouts/DashboardLayout'
export * from './templates/layouts/AuthLayout'
export * from './templates/states/EmptyState'

// Hooks
export { useTheme, useColorMode, useSystemColorMode } from './hooks/useTheme'
export * from './hooks/useResponsive'

// Providers
export { ThemeProvider } from './providers/ThemeProvider'
export type { ThemeProviderProps, Theme, ColorMode } from './providers/ThemeProvider'

// Test Status Badge
export { TestStatusBadge, useTestStatus } from './components/TestStatusBadge'

// Legacy components (for backwards compatibility) - renamed exports
export {
  Button as LegacyButton,
  buttonVariants as legacyButtonVariants,
} from './components/button'
export type { ButtonProps as LegacyButtonProps } from './components/button'
export {
  Card as LegacyCard,
  CardContent as LegacyCardContent,
  CardDescription as LegacyCardDescription,
  CardFooter as LegacyCardFooter,
  CardHeader as LegacyCardHeader,
  CardTitle as LegacyCardTitle,
} from './components/card'
