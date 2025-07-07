import { Navigation } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { Home, Users, Settings, FileText, BarChart, Calendar } from 'lucide-react'

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    active: true,
  },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    badge: 12,
  },
  {
    label: 'Reports',
    icon: BarChart,
    children: [
      { label: 'Analytics', href: '/reports/analytics' },
      { label: 'Sales', href: '/reports/sales' },
      { label: 'Marketing', href: '/reports/marketing' },
    ],
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: FileText,
    disabled: true,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

const brand = {
  name: 'NextSaaS',
  href: '/',
}

const examples = [
  {
    title: 'Horizontal Navigation',
    code: `const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    active: true,
  },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    badge: 12,
  },
  {
    label: 'Reports',
    icon: BarChart,
    children: [
      { label: 'Analytics', href: '/reports/analytics' },
      { label: 'Sales', href: '/reports/sales' },
    ],
  },
]

<Navigation
  brand={{ name: 'NextSaaS', href: '/' }}
  items={navigationItems}
  orientation="horizontal"
/>`,
    component: (
      <Navigation
        brand={brand}
        items={navigationItems}
        orientation="horizontal"
      />
    ),
  },
  {
    title: 'Vertical Navigation',
    code: `<Navigation
  brand={{ name: 'NextSaaS', href: '/' }}
  items={navigationItems}
  orientation="vertical"
/>`,
    component: (
      <div className="w-64">
        <Navigation
          brand={brand}
          items={navigationItems}
          orientation="vertical"
        />
      </div>
    ),
  },
  {
    title: 'Navigation Variants',
    code: `<div className="space-y-8">
  <Navigation
    items={[
      { label: 'Home', href: '/', active: true },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ]}
    variant="default"
  />
  
  <Navigation
    items={[
      { label: 'Home', href: '/', active: true },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ]}
    variant="pills"
  />
  
  <Navigation
    items={[
      { label: 'Home', href: '/', active: true },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ]}
    variant="underline"
  />
</div>`,
    component: (
      <div className="space-y-8">
        <Navigation
          items={[
            { label: 'Home', href: '/', active: true },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ]}
          variant="default"
        />
        
        <Navigation
          items={[
            { label: 'Home', href: '/', active: true },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ]}
          variant="pills"
        />
        
        <Navigation
          items={[
            { label: 'Home', href: '/', active: true },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ]}
          variant="underline"
        />
      </div>
    ),
  },
  {
    title: 'Navigation Sizes',
    code: `<div className="space-y-6">
  <Navigation
    items={[
      { label: 'Small', href: '/', active: true },
      { label: 'Navigation', href: '/nav' },
    ]}
    size="sm"
  />
  
  <Navigation
    items={[
      { label: 'Medium', href: '/', active: true },
      { label: 'Navigation', href: '/nav' },
    ]}
    size="md"
  />
  
  <Navigation
    items={[
      { label: 'Large', href: '/', active: true },
      { label: 'Navigation', href: '/nav' },
    ]}
    size="lg"
  />
</div>`,
    component: (
      <div className="space-y-6">
        <Navigation
          items={[
            { label: 'Small', href: '/', active: true },
            { label: 'Navigation', href: '/nav' },
          ]}
          size="sm"
        />
        
        <Navigation
          items={[
            { label: 'Medium', href: '/', active: true },
            { label: 'Navigation', href: '/nav' },
          ]}
          size="md"
        />
        
        <Navigation
          items={[
            { label: 'Large', href: '/', active: true },
            { label: 'Navigation', href: '/nav' },
          ]}
          size="lg"
        />
      </div>
    ),
  },
]

export default function NavigationPage() {
  return (
    <ComponentLayout
      title="Navigation"
      description="A flexible navigation component that supports horizontal and vertical orientations, nested items, and various styling options."
      examples={examples}
    />
  )
}