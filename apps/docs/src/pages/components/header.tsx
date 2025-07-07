import { Header } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { Bell, Settings, Search, Plus } from 'lucide-react'

const brand = {
  name: 'NextSaaS',
  href: '/',
}

const user = {
  name: 'John Doe',
  email: 'john@example.com',
  initials: 'JD',
}

const actions = [
  {
    label: 'Notifications',
    icon: Bell,
    onClick: () => console.log('Notifications clicked'),
    badge: 3,
    variant: 'ghost' as const,
  },
  {
    label: 'Create',
    icon: Plus,
    onClick: () => console.log('Create clicked'),
    variant: 'default' as const,
  },
]

const examples = [
  {
    title: 'Basic Header',
    code: `<Header
  brand={{ name: 'NextSaaS', href: '/' }}
  title="Dashboard"
  subtitle="Welcome back to your dashboard"
/>`,
    component: (
      <Header
        brand={brand}
        title="Dashboard"
        subtitle="Welcome back to your dashboard"
      />
    ),
  },
  {
    title: 'Header with Search',
    code: `<Header
  brand={{ name: 'NextSaaS', href: '/' }}
  title="Projects"
  search={{
    placeholder: 'Search projects...',
    onSearch: (query) => console.log('Searching:', query),
  }}
/>`,
    component: (
      <Header
        brand={brand}
        title="Projects"
        search={{
          placeholder: 'Search projects...',
          onSearch: (query) => console.log('Searching:', query),
        }}
      />
    ),
  },
  {
    title: 'Header with Actions',
    code: `const actions = [
  {
    label: 'Notifications',
    icon: Bell,
    onClick: () => console.log('Notifications clicked'),
    badge: 3,
    variant: 'ghost',
  },
  {
    label: 'Create',
    icon: Plus,
    onClick: () => console.log('Create clicked'),
    variant: 'default',
  },
]

<Header
  brand={{ name: 'NextSaaS', href: '/' }}
  title="Team"
  actions={actions}
/>`,
    component: (
      <Header
        brand={brand}
        title="Team"
        actions={actions}
      />
    ),
  },
  {
    title: 'Header with User',
    code: `const user = {
  name: 'John Doe',
  email: 'john@example.com',
  initials: 'JD',
}

<Header
  brand={{ name: 'NextSaaS', href: '/' }}
  title="Settings"
  user={user}
  onUserMenuClick={() => console.log('User menu clicked')}
/>`,
    component: (
      <Header
        brand={brand}
        title="Settings"
        user={user}
        onUserMenuClick={() => console.log('User menu clicked')}
      />
    ),
  },
  {
    title: 'Complete Header',
    code: `<Header
  brand={{ name: 'NextSaaS', href: '/' }}
  title="Dashboard"
  subtitle="Manage your projects and team"
  search={{
    placeholder: 'Search anything...',
    onSearch: (query) => console.log('Searching:', query),
  }}
  actions={actions}
  user={user}
  onUserMenuClick={() => console.log('User menu clicked')}
/>`,
    component: (
      <Header
        brand={brand}
        title="Dashboard"
        subtitle="Manage your projects and team"
        search={{
          placeholder: 'Search anything...',
          onSearch: (query) => console.log('Searching:', query),
        }}
        actions={actions}
        user={user}
        onUserMenuClick={() => console.log('User menu clicked')}
      />
    ),
  },
  {
    title: 'Header Variants',
    code: `<div className="space-y-4">
  <Header
    brand={{ name: 'Default' }}
    title="Default Header"
    variant="default"
  />
  
  <Header
    brand={{ name: 'Sticky' }}
    title="Sticky Header"
    variant="sticky"
  />
  
  <Header
    brand={{ name: 'Floating' }}
    title="Floating Header"
    variant="floating"
  />
</div>`,
    component: (
      <div className="space-y-4">
        <Header
          brand={{ name: 'Default' }}
          title="Default Header"
          variant="default"
        />
        
        <Header
          brand={{ name: 'Sticky' }}
          title="Sticky Header"
          variant="sticky"
        />
        
        <Header
          brand={{ name: 'Floating' }}
          title="Floating Header"
          variant="floating"
        />
      </div>
    ),
  },
]

export default function HeaderPage() {
  return (
    <ComponentLayout
      title="Header"
      description="A flexible header component for application layouts with support for branding, search, actions, and user menus."
      examples={examples}
    />
  )
}