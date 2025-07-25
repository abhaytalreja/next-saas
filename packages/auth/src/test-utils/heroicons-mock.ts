// Mock for @heroicons/react
import React from 'react'

// Create a generic icon component factory
const createMockIcon = (name: string) => (props: any) =>
  React.createElement('svg', {
    'data-testid': `${name.toLowerCase()}-icon`,
    'aria-hidden': true,
    ...props
  })

// Export all commonly used heroicons
export const UserIcon = createMockIcon('User')
export const ClockIcon = createMockIcon('Clock')
export const ArrowDownTrayIcon = createMockIcon('ArrowDownTray')
export const TrashIcon = createMockIcon('Trash')
export const CogIcon = createMockIcon('Cog')
export const PhotoIcon = createMockIcon('Photo')
export const EyeIcon = createMockIcon('Eye')
export const EyeSlashIcon = createMockIcon('EyeSlash')
export const BuildingOfficeIcon = createMockIcon('BuildingOffice')
export const ShieldCheckIcon = createMockIcon('ShieldCheck')
export const ExclamationTriangleIcon = createMockIcon('ExclamationTriangle')
export const CheckIcon = createMockIcon('Check')
export const XMarkIcon = createMockIcon('XMark')
export const ArrowLeftIcon = createMockIcon('ArrowLeft')
export const ArrowRightIcon = createMockIcon('ArrowRight')
export const PlusIcon = createMockIcon('Plus')
export const MinusIcon = createMockIcon('Minus')
export const PencilIcon = createMockIcon('Pencil')
export const DocumentIcon = createMockIcon('Document')
export const CloudArrowUpIcon = createMockIcon('CloudArrowUp')
export const SparklesIcon = createMockIcon('Sparkles')

// Default export with all icons
const heroicons = {
  UserIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CogIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  SparklesIcon
}

export default heroicons