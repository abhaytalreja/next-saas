// Mock for lucide-react
import React from 'react'

// Create a generic icon component factory
const createMockIcon = (name: string) => (props: any) =>
  React.createElement('svg', {
    'data-testid': `${name.toLowerCase()}-icon`,
    'aria-hidden': true,
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props
  })

// Export all commonly used lucide icons
export const User = createMockIcon('User')
export const Shield = createMockIcon('Shield')
export const Activity = createMockIcon('Activity')
export const Download = createMockIcon('Download')
export const Trash2 = createMockIcon('Trash2')
export const Settings = createMockIcon('Settings')
export const Eye = createMockIcon('Eye')
export const EyeOff = createMockIcon('EyeOff')
export const Building = createMockIcon('Building')
export const AlertTriangle = createMockIcon('AlertTriangle')
export const Check = createMockIcon('Check')
export const X = createMockIcon('X')
export const ArrowLeft = createMockIcon('ArrowLeft')
export const ArrowRight = createMockIcon('ArrowRight')
export const Plus = createMockIcon('Plus')
export const Minus = createMockIcon('Minus')
export const Edit = createMockIcon('Edit')
export const FileText = createMockIcon('FileText')
export const Upload = createMockIcon('Upload')
export const Camera = createMockIcon('Camera')
export const Mail = createMockIcon('Mail')
export const Phone = createMockIcon('Phone')
export const MapPin = createMockIcon('MapPin')
export const Calendar = createMockIcon('Calendar')
export const Clock = createMockIcon('Clock')
export const Users = createMockIcon('Users')
export const Key = createMockIcon('Key')
export const Lock = createMockIcon('Lock')
export const Unlock = createMockIcon('Unlock')

// Default export
const lucideReact = {
  User,
  Shield,
  Activity,
  Download,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Building,
  AlertTriangle,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Edit,
  FileText,
  Upload,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  Key,
  Lock,
  Unlock
}

export default lucideReact