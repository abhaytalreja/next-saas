import Link from 'next/link'

const componentCategories = [
  {
    id: 'authentication',
    name: 'Authentication',
    description: 'Complete authentication components',
    components: [
      { name: 'Auth Components Overview', href: '/components/auth-components', status: '✅', featured: true },
      { name: 'LoginForm', href: '/components/auth-components#loginform', status: '✓' },
      { name: 'SignUpForm', href: '/components/auth-components#signupform', status: '✓' },
      { name: 'ProfileForm', href: '/components/auth-components#profileform', status: '✓' },
      { name: 'AccountDropdown', href: '/components/auth-components#accountdropdown', status: '✓' },
      { name: 'OrganizationSwitcher', href: '/components/auth-components#organizationswitcher', status: '✓' },
      { name: 'MembersList', href: '/components/auth-components#memberslist', status: '✓' },
      { name: 'UserAvatar', href: '/components/auth-components#useravatar', status: '✓' },
    ]
  },
  {
    id: 'actions',
    name: 'Actions',
    description: 'Interactive elements',
    components: [
      { name: 'Button', href: '/components/button', status: '✓' },
      { name: 'IconButton', href: '/components/icon-button', status: '✓' },
      { name: 'Link', href: '/components/link', status: '✓' },
    ]
  },
  {
    id: 'forms',
    name: 'Forms',
    description: 'Form input components',
    components: [
      { name: 'Input', href: '/components/input', status: '✓' },
      { name: 'Select', href: '/components/select', status: '✓' },
      { name: 'Checkbox', href: '/components/checkbox', status: '✓' },
      { name: 'Radio', href: '/components/radio', status: '✓' },
      { name: 'Textarea', href: '/components/textarea', status: '✓' },
      { name: 'Switch', href: '/components/switch', status: '✓' },
      { name: 'Form', href: '/components/form', status: '✓' },
      { name: 'FormField', href: '/components/form-field', status: '✓' },
      { name: 'SearchBox', href: '/components/search-box', status: '✓' },
      { name: 'DatePicker', href: '/components/date-picker', status: '✓' },
      { name: 'FileUploader', href: '/components/file-uploader', status: '✓' },
    ]
  },
  {
    id: 'layout',
    name: 'Layout',
    description: 'Layout and spacing',
    components: [
      { name: 'Container', href: '/components/container', status: '✓' },
      { name: 'Grid', href: '/components/grid', status: '✓' },
      { name: 'Stack', href: '/components/stack', status: '✓' },
      { name: 'Section', href: '/components/section', status: '✓' },
    ]
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Navigation components',
    components: [
      { name: 'Tabs', href: '/components/tabs', status: '✓' },
      { name: 'Breadcrumb', href: '/components/breadcrumb', status: '✓' },
      { name: 'Pagination', href: '/components/pagination', status: '✓' },
      { name: 'Navbar', href: '/components/navbar', status: '✓' },
      { name: 'Sidebar', href: '/components/sidebar', status: '✓' },
      { name: 'Menu', href: '/components/menu', status: '✓' },
      { name: 'ContextMenu', href: '/components/context-menu', status: '✓' },
      { name: 'DropdownMenu', href: '/components/dropdown-menu', status: '✓' },
      { name: 'Navigation', href: '/components/navigation', status: '✓' },
      { name: 'Header', href: '/components/header', status: '✓' },
      { name: 'CommandPalette', href: '/components/command-palette', status: '✓' },
    ]
  },
  {
    id: 'data-display',
    name: 'Data Display',
    description: 'Display data and content',
    components: [
      { name: 'Card', href: '/components/card', status: '✓' },
      { name: 'Table', href: '/components/table', status: '✓' },
      { name: 'List', href: '/components/list', status: '✓' },
      { name: 'Stat', href: '/components/stat', status: '✓' },
      { name: 'Badge', href: '/components/badge', status: '✓' },
      { name: 'Tag', href: '/components/tag', status: '✓' },
      { name: 'Avatar', href: '/components/avatar', status: '✓' },
      { name: 'Skeleton', href: '/components/skeleton', status: '✓' },
      { name: 'Divider', href: '/components/divider', status: '✓' },
      { name: 'DataTable', href: '/components/data-table', status: '✓' },
      { name: 'DataGrid', href: '/components/data-grid', status: '✓' },
      { name: 'Icon', href: '/components/icon', status: '✓' },
    ]
  },
  {
    id: 'feedback',
    name: 'Feedback',
    description: 'User feedback and status',
    components: [
      { name: 'Alert', href: '/components/alert', status: '✓' },
      { name: 'Progress', href: '/components/progress', status: '✓' },
      { name: 'Spinner', href: '/components/spinner', status: '✓' },
      { name: 'Tooltip', href: '/components/tooltip', status: '✓' },
      { name: 'Toast', href: '/components/toast', status: '✓' },
      { name: 'Modal', href: '/components/modal', status: '✓' },
      { name: 'Drawer', href: '/components/drawer', status: '✓' },
      { name: 'NotificationCenter', href: '/components/notification-center', status: '✓' },
    ]
  },
  {
    id: 'typography',
    name: 'Typography',
    description: 'Text and typography',
    components: [
      { name: 'Heading', href: '/components/heading', status: '✓' },
      { name: 'Text', href: '/components/text', status: '✓' },
    ]
  },
  {
    id: 'organisms',
    name: 'Organisms',
    description: 'Complex UI patterns and widgets',
    components: [
      { name: 'Dashboard', href: '/components/dashboard', status: '✓' },
    ]
  },
  {
    id: 'templates',
    name: 'Templates',
    description: 'Page-level layouts and empty states',
    components: [
      { name: 'EmptyState', href: '/components/empty-state', status: '✓' },
      { name: 'DashboardLayout', href: '/components/dashboard-layout', status: '✓' },
      { name: 'AuthLayout', href: '/components/auth-layout', status: '✓' },
    ]
  }
]

export default function ComponentsOverviewPage() {
  const totalComponents = componentCategories.reduce((acc, cat) => acc + cat.components.length, 0)

  return (
    <div className="prose max-w-none">
      <div className="mb-8">
        <h1>Component Gallery</h1>
        <p className="text-lg text-gray-600">
          Browse all {totalComponents} UI components organized by category. Click any component to see detailed documentation and live examples.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 not-prose">
        {componentCategories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-3">
              <h3 className="font-semibold text-base">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
            <ul className="space-y-2">
              {category.components.map((component) => (
                <li key={component.name}>
                  <Link
                    href={component.href}
                    className={`flex items-center justify-between text-sm hover:text-blue-600 transition-colors ${
                      component.featured ? 'font-medium text-blue-600' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {component.name}
                      {component.featured && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </span>
                    <span className="text-green-600 text-xs">{component.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Start - UI Components</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          <code>{`import { Button, Card, Input } from '@nextsaas/ui'

export function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  )
}`}</code>
        </pre>
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Start - Authentication</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          <code>{`import { LoginForm, useAuth, AccountDropdown } from '@nextsaas/auth'

export function AuthExample() {
  const { user, signOut } = useAuth()
  
  if (!user) {
    return <LoginForm redirectTo="/dashboard" />
  }
  
  return (
    <div>
      <AccountDropdown />
      <h1>Welcome, {user.email}!</h1>
    </div>
  )
}`}</code>
        </pre>
      </div>
    </div>
  )
}