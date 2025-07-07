import { Icon } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { 
  Home, 
  User, 
  Settings, 
  Mail, 
  Phone, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Download,
  Upload,
  Star,
  Heart,
  Bell,
  Calendar
} from 'lucide-react'

const BasicExample = () => {
  return (
    <div className="flex items-center gap-4">
      <Icon icon={Home} />
      <Icon icon={User} />
      <Icon icon={Settings} />
      <Icon icon={Mail} />
      <Icon icon={Phone} />
    </div>
  )
}

const SizesExample = () => {
  return (
    <div className="flex items-center gap-4">
      <Icon icon={Star} size="xs" />
      <Icon icon={Star} size="sm" />
      <Icon icon={Star} size="md" />
      <Icon icon={Star} size="lg" />
      <Icon icon={Star} size="xl" />
    </div>
  )
}

const VariantsExample = () => {
  return (
    <div className="flex items-center gap-4">
      <Icon icon={Heart} variant="default" />
      <Icon icon={Heart} variant="muted" />
      <Icon icon={Heart} variant="destructive" />
      <Icon icon={Heart} variant="success" />
      <Icon icon={Heart} variant="warning" />
    </div>
  )
}

const CommonIconsExample = () => {
  const commonIcons = [
    { icon: Home, label: 'Home' },
    { icon: User, label: 'User' },
    { icon: Settings, label: 'Settings' },
    { icon: Mail, label: 'Mail' },
    { icon: Phone, label: 'Phone' },
    { icon: Search, label: 'Search' },
    { icon: Plus, label: 'Plus' },
    { icon: Edit, label: 'Edit' },
    { icon: Trash, label: 'Trash' },
    { icon: Download, label: 'Download' },
    { icon: Upload, label: 'Upload' },
    { icon: Bell, label: 'Bell' },
    { icon: Calendar, label: 'Calendar' },
    { icon: Star, label: 'Star' },
    { icon: Heart, label: 'Heart' },
  ]

  return (
    <div className="grid grid-cols-5 gap-4">
      {commonIcons.map(({ icon, label }) => (
        <div key={label} className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors">
          <Icon icon={icon} size="lg" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}

const InButtonsExample = () => {
  return (
    <div className="flex items-center gap-4">
      <button className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
        <Icon icon={Plus} size="sm" />
        Create
      </button>
      
      <button className="inline-flex items-center gap-2 px-3 py-2 border border-input rounded-md hover:bg-accent transition-colors">
        <Icon icon={Download} size="sm" />
        Download
      </button>
      
      <button className="inline-flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
        <Icon icon={Trash} size="sm" />
        Delete
      </button>
    </div>
  )
}

const CustomStylingExample = () => {
  return (
    <div className="flex items-center gap-4">
      <Icon 
        icon={Star} 
        className="text-yellow-500 hover:text-yellow-600 cursor-pointer transition-colors" 
        size="lg" 
      />
      <Icon 
        icon={Heart} 
        className="text-red-500 hover:text-red-600 cursor-pointer transition-colors" 
        size="lg" 
      />
      <Icon 
        icon={Settings} 
        className="text-blue-500 hover:text-blue-600 cursor-pointer transition-colors animate-spin" 
        size="lg" 
      />
    </div>
  )
}

const examples = [
  {
    title: 'Basic Icons',
    code: `import { Home, User, Settings, Mail, Phone } from 'lucide-react'

<div className="flex items-center gap-4">
  <Icon icon={Home} />
  <Icon icon={User} />
  <Icon icon={Settings} />
  <Icon icon={Mail} />
  <Icon icon={Phone} />
</div>`,
    component: <BasicExample />,
  },
  {
    title: 'Icon Sizes',
    code: `<div className="flex items-center gap-4">
  <Icon icon={Star} size="xs" />
  <Icon icon={Star} size="sm" />
  <Icon icon={Star} size="md" />
  <Icon icon={Star} size="lg" />
  <Icon icon={Star} size="xl" />
</div>`,
    component: <SizesExample />,
  },
  {
    title: 'Icon Variants',
    code: `<div className="flex items-center gap-4">
  <Icon icon={Heart} variant="default" />
  <Icon icon={Heart} variant="muted" />
  <Icon icon={Heart} variant="destructive" />
  <Icon icon={Heart} variant="success" />
  <Icon icon={Heart} variant="warning" />
</div>`,
    component: <VariantsExample />,
  },
  {
    title: 'Common Icons Gallery',
    code: `const commonIcons = [
  { icon: Home, label: 'Home' },
  { icon: User, label: 'User' },
  { icon: Settings, label: 'Settings' },
  // ... more icons
]

{commonIcons.map(({ icon, label }) => (
  <div key={label} className="flex flex-col items-center gap-2">
    <Icon icon={icon} size="lg" />
    <span className="text-xs">{label}</span>
  </div>
))}`,
    component: <CommonIconsExample />,
  },
  {
    title: 'Icons in Buttons',
    code: `<button className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md">
  <Icon icon={Plus} size="sm" />
  Create
</button>

<button className="inline-flex items-center gap-2 px-3 py-2 border rounded-md">
  <Icon icon={Download} size="sm" />
  Download
</button>

<button className="inline-flex items-center gap-2 px-3 py-2 text-destructive">
  <Icon icon={Trash} size="sm" />
  Delete
</button>`,
    component: <InButtonsExample />,
  },
  {
    title: 'Custom Styling',
    code: `<Icon 
  icon={Star} 
  className="text-yellow-500 hover:text-yellow-600 cursor-pointer transition-colors" 
  size="lg" 
/>

<Icon 
  icon={Heart} 
  className="text-red-500 hover:text-red-600 cursor-pointer transition-colors" 
  size="lg" 
/>

<Icon 
  icon={Settings} 
  className="text-blue-500 animate-spin" 
  size="lg" 
/>`,
    component: <CustomStylingExample />,
  },
]

export default function IconPage() {
  return (
    <ComponentLayout
      title="Icon"
      description="A flexible icon component built on Lucide React with size variants, semantic colors, and easy customization for consistent iconography."
      examples={examples}
    />
  )
}