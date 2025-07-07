import { IconButton } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { 
  Home, 
  Settings, 
  User, 
  Mail, 
  Heart,
  Star,
  Plus,
  Edit,
  Trash,
  Download,
  Search,
  X
} from 'lucide-react'

const BasicExample = () => {
  return (
    <div className="flex items-center gap-4">
      <IconButton icon={Home} />
      <IconButton icon={Settings} />
      <IconButton icon={User} />
      <IconButton icon={Mail} />
    </div>
  )
}

const SizesExample = () => {
  return (
    <div className="flex items-center gap-4">
      <IconButton icon={Star} size="xs" />
      <IconButton icon={Star} size="sm" />
      <IconButton icon={Star} size="md" />
      <IconButton icon={Star} size="lg" />
      <IconButton icon={Star} size="xl" />
    </div>
  )
}

const VariantsExample = () => {
  return (
    <div className="flex items-center gap-4">
      <IconButton icon={Plus} variant="primary" />
      <IconButton icon={Edit} variant="secondary" />
      <IconButton icon={Download} variant="outline" />
      <IconButton icon={Trash} variant="destructive" />
      <IconButton icon={Heart} variant="ghost" />
    </div>
  )
}

const StatesExample = () => {
  return (
    <div className="flex items-center gap-4">
      <IconButton icon={Settings} />
      <IconButton icon={Settings} disabled />
      <IconButton icon={Settings} loading />
    </div>
  )
}

const ShapesExample = () => {
  return (
    <div className="flex items-center gap-4">
      <IconButton icon={User} shape="square" />
      <IconButton icon={User} shape="circle" />
    </div>
  )
}

const ActionsExample = () => {
  return (
    <div className="flex items-center gap-4">
      <IconButton 
        icon={Search} 
        tooltip="Search"
        onClick={() => console.log('Search clicked')}
      />
      <IconButton 
        icon={X} 
        variant="ghost"
        tooltip="Close"
        onClick={() => console.log('Close clicked')}
      />
      <IconButton 
        icon={Settings} 
        tooltip="Settings"
        href="/settings"
      />
    </div>
  )
}

const examples = [
  {
    title: 'Basic Icon Buttons',
    code: `import { Home, Settings, User, Mail } from 'lucide-react'

<div className="flex items-center gap-4">
  <IconButton icon={Home} />
  <IconButton icon={Settings} />
  <IconButton icon={User} />
  <IconButton icon={Mail} />
</div>`,
    component: <BasicExample />,
  },
  {
    title: 'Button Sizes',
    code: `<div className="flex items-center gap-4">
  <IconButton icon={Star} size="xs" />
  <IconButton icon={Star} size="sm" />
  <IconButton icon={Star} size="md" />
  <IconButton icon={Star} size="lg" />
  <IconButton icon={Star} size="xl" />
</div>`,
    component: <SizesExample />,
  },
  {
    title: 'Button Variants',
    code: `<div className="flex items-center gap-4">
  <IconButton icon={Plus} variant="primary" />
  <IconButton icon={Edit} variant="secondary" />
  <IconButton icon={Download} variant="outline" />
  <IconButton icon={Trash} variant="destructive" />
  <IconButton icon={Heart} variant="ghost" />
</div>`,
    component: <VariantsExample />,
  },
  {
    title: 'Button States',
    code: `<div className="flex items-center gap-4">
  <IconButton icon={Settings} />
  <IconButton icon={Settings} disabled />
  <IconButton icon={Settings} loading />
</div>`,
    component: <StatesExample />,
  },
  {
    title: 'Button Shapes',
    code: `<div className="flex items-center gap-4">
  <IconButton icon={User} shape="square" />
  <IconButton icon={User} shape="circle" />
</div>`,
    component: <ShapesExample />,
  },
  {
    title: 'Interactive Examples',
    code: `<div className="flex items-center gap-4">
  <IconButton 
    icon={Search} 
    tooltip="Search"
    onClick={() => console.log('Search clicked')}
  />
  <IconButton 
    icon={X} 
    variant="ghost"
    tooltip="Close"
    onClick={() => console.log('Close clicked')}
  />
  <IconButton 
    icon={Settings} 
    tooltip="Settings"
    href="/settings"
  />
</div>`,
    component: <ActionsExample />,
  },
]

export default function IconButtonPage() {
  return (
    <ComponentLayout
      title="Icon Button"
      description="A compact button component that displays only an icon, perfect for toolbars, actions, and space-constrained interfaces."
      examples={examples}
    />
  )
}