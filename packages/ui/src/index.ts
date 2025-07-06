// Core utilities
export * from './lib/utils'
export * from './utils/component-validator'

// Atoms
export * from './atoms/buttons/Button'
export * from './atoms/inputs/Input'
export * from './atoms/typography/Heading'
export * from './atoms/typography/Text'
export * from './atoms/badges/Badge'
export * from './atoms/avatars/Avatar'
export * from './atoms/spinners/Spinner'
export * from './atoms/toggles/Switch'

// Molecules
export * from './molecules/cards/Card'
export * from './molecules/alerts/Alert'

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
