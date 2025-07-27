import { DashboardLayout, Button } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import {
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  Bell,
  Search,
  Menu,
  Plus,
  Download,
} from 'lucide-react'

const sampleSidebarItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    active: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    badge: 'New',
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    href: '/users',
    count: 1247,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    href: '/documents',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
]

const sampleBreadcrumbs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Reports' },
]

const sampleUserMenu = [
  { label: 'Profile', href: '/profile' },
  { label: 'Settings', href: '/settings' },
  { label: 'Billing', href: '/billing' },
  { divider: true },
  { label: 'Sign out', href: '/logout' },
]

const BasicExample = () => {
  return (
    <div className="h-[500px] border rounded-lg overflow-hidden">
      <DashboardLayout
        sidebarItems={sampleSidebarItems}
        title="Analytics Dashboard"
        user={{
          name: 'John Doe',
          email: 'john@example.com',
          avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Dashboard Content</h2>
          <p className="text-muted-foreground mb-6">
            This is the main content area where your dashboard components would
            go.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Revenue</h3>
              <p className="text-2xl font-bold">$45,231</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Users</h3>
              <p className="text-2xl font-bold">2,150</p>
              <p className="text-sm text-green-600">+8.2% from last week</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Orders</h3>
              <p className="text-2xl font-bold">186</p>
              <p className="text-sm text-red-600">-3.1% from yesterday</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  )
}

const WithBreadcrumbsExample = () => {
  return (
    <div className="h-[500px] border rounded-lg overflow-hidden">
      <DashboardLayout
        sidebarItems={sampleSidebarItems}
        title="Reports"
        breadcrumbs={sampleBreadcrumbs}
        user={{
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
          avatar:
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Monthly Reports</h2>
          <p className="text-muted-foreground">
            View detailed analytics and reports for your business performance.
          </p>
        </div>
      </DashboardLayout>
    </div>
  )
}

const WithActionsExample = () => {
  const headerActions: React.ReactNode = [
    {
      label: 'Export',
      icon: Download,
      onClick: () => console.log('Export clicked'),
      variant: 'outline' as const,
    },
    {
      label: 'Create New',
      icon: Plus,
      onClick: () => console.log('Create clicked'),
      variant: 'default' as const,
    },
  ] as any

  return (
    <div className="h-[500px] border rounded-lg overflow-hidden">
      <DashboardLayout
        sidebarItems={sampleSidebarItems}
        title="User Management"
        headerActions={headerActions}
        user={{
          name: 'Alex Chen',
          email: 'alex@example.com',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        }}
        search={{
          placeholder: 'Search users...',
          onSearch: query => console.log('Search:', query),
        }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-muted"></div>
                <div>
                  <p className="font-medium">Team Member {i}</p>
                  <p className="text-sm text-muted-foreground">
                    member{i}@example.com
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </div>
  )
}

const ResponsiveExample = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-[500px] border rounded-lg overflow-hidden">
      <DashboardLayout
        sidebarItems={sampleSidebarItems}
        title="Responsive Layout"
        user={{
          name: 'Maria Garcia',
          email: 'maria@example.com',
          avatar:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        }}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapse={collapsed => setSidebarCollapsed(collapsed)}
        notifications={{
          count: 3,
          onClick: () => console.log('Notifications clicked'),
        }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Responsive Design</h2>
          <p className="text-muted-foreground mb-4">
            The sidebar automatically collapses on mobile devices and can be
            toggled manually.
          </p>

          <Button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
          </Button>
        </div>
      </DashboardLayout>
    </div>
  )
}

const CustomizationExample = () => {
  return (
    <div className="h-[500px] border rounded-lg overflow-hidden">
      <DashboardLayout
        sidebarItems={sampleSidebarItems}
        title="Custom Branding"
        brand={{
          name: 'Your Company',
          logo: '/api/placeholder/120/40',
          href: '/',
        }}
        user={{
          name: 'David Kim',
          email: 'david@example.com',
          avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
        }}
        theme="dark"
        sidebarWidth={280}
        headerHeight={64}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Customized Layout</h2>
          <p className="text-muted-foreground">
            This layout demonstrates custom branding, theming, and sizing
            options.
          </p>
        </div>
      </DashboardLayout>
    </div>
  )
}

const examples = [
  {
    title: 'Basic Dashboard Layout',
    code: `const sidebarItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    active: true,
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    href: '/users',
    count: 1247,
  },
  // ... more items
]

<DashboardLayout
  sidebarItems={sidebarItems}
  title="Analytics Dashboard"
  user={{
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatar.jpg',
  }}
  userMenuItems={userMenuItems}
>
  <div className="p-6">
    <h2>Dashboard Content</h2>
    {/* Your dashboard content */}
  </div>
</DashboardLayout>`,
    component: <BasicExample />,
  },
  {
    title: 'With Breadcrumbs',
    code: `const breadcrumbs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Reports' },
]

<DashboardLayout
  sidebarItems={sidebarItems}
  title="Reports"
  breadcrumbs={breadcrumbs}
  user={user}
  userMenuItems={userMenuItems}
>
  {/* Content */}
</DashboardLayout>`,
    component: <WithBreadcrumbsExample />,
  },
  {
    title: 'With Header Actions',
    code: `const headerActions = [
  {
    label: 'Export',
    icon: Download,
    onClick: () => console.log('Export'),
    variant: 'outline',
  },
  {
    label: 'Create New',
    icon: Plus,
    onClick: () => console.log('Create'),
    variant: 'default',
  },
]

<DashboardLayout
  sidebarItems={sidebarItems}
  title="User Management"
  headerActions={headerActions}
  user={user}
  searchPlaceholder="Search users..."
  onSearch={(query) => console.log('Search:', query)}
>
  {/* Content */}
</DashboardLayout>`,
    component: <WithActionsExample />,
  },
  {
    title: 'Responsive Layout',
    code: `const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

<DashboardLayout
  sidebarItems={sidebarItems}
  title="Responsive Layout"
  user={user}
  sidebarCollapsed={sidebarCollapsed}
  onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
  notificationCount={3}
>
  {/* Content */}
</DashboardLayout>`,
    component: <ResponsiveExample />,
  },
  {
    title: 'Custom Branding',
    code: `<DashboardLayout
  sidebarItems={sidebarItems}
  title="Custom Branding"
  logo={{
    src: '/logo.png',
    alt: 'Company Logo',
    href: '/',
  }}
  user={user}
  theme="dark"
  sidebarWidth={280}
  headerHeight={64}
>
  {/* Content */}
</DashboardLayout>`,
    component: <CustomizationExample />,
  },
]

export default function DashboardLayoutPage() {
  return (
    <ComponentLayout
      title="Dashboard Layout"
      description="A complete application layout with sidebar navigation, header, breadcrumbs, and user management for building dashboard interfaces."
      examples={examples}
    />
  )
}
