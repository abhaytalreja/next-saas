import { Sidebar, Button } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import { 
  Home, Users, Settings, FileText, BarChart, Mail, 
  Calendar, ShoppingCart, CreditCard, Bell, Search,
  ChevronDown, ChevronRight, Menu, X, LogOut
} from 'lucide-react'

const BasicExample = () => {
  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Users', href: '/users', icon: Users },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'Analytics', href: '/analytics', icon: BarChart },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="flex h-64 border border-gray-200 rounded-lg overflow-hidden">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 p-6 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Main Content</h3>
        <p className="text-gray-600 mt-2">Your page content goes here.</p>
      </div>
    </div>
  )
}

const CollapsibleExample = () => {
  const [collapsed, setCollapsed] = useState(false)

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Users', href: '/users', icon: Users },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'Analytics', href: '/analytics', icon: BarChart },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="flex h-64 border border-gray-200 rounded-lg overflow-hidden">
      <Sidebar 
        items={sidebarItems} 
        collapsed={collapsed}
        onCollapseToggle={() => setCollapsed(!collapsed)}
      />
      <div className="flex-1 p-6 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Collapsible Sidebar</h3>
        <p className="text-gray-600 mt-2">
          The sidebar can be collapsed to save space. Click the toggle button to collapse/expand.
        </p>
      </div>
    </div>
  )
}

const NestedItemsExample = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['products'])

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { 
      label: 'Products', 
      icon: ShoppingCart,
      expanded: expandedItems.includes('products'),
      onToggle: () => {
        setExpandedItems(prev => 
          prev.includes('products') 
            ? prev.filter(id => id !== 'products')
            : [...prev, 'products']
        )
      },
      children: [
        { label: 'All Products', href: '/products' },
        { label: 'Categories', href: '/products/categories' },
        { label: 'Inventory', href: '/products/inventory' },
        { label: 'Add New', href: '/products/new' },
      ]
    },
    { 
      label: 'Users', 
      icon: Users,
      expanded: expandedItems.includes('users'),
      onToggle: () => {
        setExpandedItems(prev => 
          prev.includes('users') 
            ? prev.filter(id => id !== 'users')
            : [...prev, 'users']
        )
      },
      children: [
        { label: 'All Users', href: '/users' },
        { label: 'Roles', href: '/users/roles' },
        { label: 'Permissions', href: '/users/permissions' },
      ]
    },
    { label: 'Analytics', href: '/analytics', icon: BarChart },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="flex h-96 border border-gray-200 rounded-lg overflow-hidden">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 p-6 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Nested Navigation</h3>
        <p className="text-gray-600 mt-2">
          Sidebar supports nested items for organizing complex navigation structures.
        </p>
      </div>
    </div>
  )
}

const WithHeaderFooterExample = () => {
  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home, active: true },
    { label: 'Messages', href: '/messages', icon: Mail, badge: '3' },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Reports', href: '/reports', icon: BarChart },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  const header = (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          A
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Acme Inc</h3>
          <p className="text-sm text-gray-500">Enterprise</p>
        </div>
      </div>
    </div>
  )

  const footer = (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">John Doe</p>
          <p className="text-xs text-gray-500">john@acme.com</p>
        </div>
      </div>
      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  )

  return (
    <div className="flex h-96 border border-gray-200 rounded-lg overflow-hidden">
      <Sidebar 
        items={sidebarItems} 
        header={header}
        footer={footer}
      />
      <div className="flex-1 p-6 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Header & Footer</h3>
        <p className="text-gray-600 mt-2">
          Add custom header and footer content to the sidebar for branding and user info.
        </p>
      </div>
    </div>
  )
}

const VariantsExample = () => {
  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Users', href: '/users', icon: Users },
    { label: 'Analytics', href: '/analytics', icon: BarChart },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Default Variant</h4>
        <div className="flex h-48 border border-gray-200 rounded-lg overflow-hidden">
          <Sidebar items={sidebarItems} />
          <div className="flex-1 p-4 bg-gray-50">
            <p className="text-sm text-gray-600">Default sidebar style</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Dark Variant</h4>
        <div className="flex h-48 border border-gray-200 rounded-lg overflow-hidden">
          <Sidebar items={sidebarItems} variant="dark" />
          <div className="flex-1 p-4 bg-gray-50">
            <p className="text-sm text-gray-600">Dark sidebar style</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Bordered Variant</h4>
        <div className="flex h-48 border border-gray-200 rounded-lg overflow-hidden">
          <Sidebar items={sidebarItems} variant="bordered" />
          <div className="flex-1 p-4 bg-gray-50">
            <p className="text-sm text-gray-600">Bordered sidebar style</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const WithSearchExample = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Users', href: '/users', icon: Users },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'Analytics', href: '/analytics', icon: BarChart },
    { label: 'Messages', href: '/messages', icon: Mail },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  const filteredItems = sidebarItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const searchBar = (
    <div className="p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search navigation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )

  return (
    <div className="flex h-96 border border-gray-200 rounded-lg overflow-hidden">
      <Sidebar 
        items={filteredItems} 
        header={searchBar}
      />
      <div className="flex-1 p-6 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Searchable Sidebar</h3>
        <p className="text-gray-600 mt-2">
          Filter navigation items by typing in the search box.
        </p>
      </div>
    </div>
  )
}

const MobileResponsiveExample = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Users', href: '/users', icon: Users },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'Analytics', href: '/analytics', icon: BarChart },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="relative">
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex h-64 border border-gray-200 rounded-lg overflow-hidden mt-4">
        {/* Mobile Overlay */}
        {mobileOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative fixed inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
        `}>
          <Sidebar 
            items={sidebarItems}
            onItemClick={() => setMobileOpen(false)}
          />
        </div>
        
        <div className="flex-1 p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Mobile Responsive</h3>
          <p className="text-gray-600 mt-2">
            On mobile devices, the sidebar slides in from the left as an overlay.
          </p>
        </div>
      </div>
    </div>
  )
}

const examples = [
  {
    title: 'Basic Sidebar',
    code: `const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Analytics', href: '/analytics', icon: BarChart },
  { label: 'Settings', href: '/settings', icon: Settings },
]

<div className="flex h-64">
  <Sidebar items={sidebarItems} />
  <div className="flex-1 p-6">
    <h3>Main Content</h3>
  </div>
</div>`,
    component: <BasicExample />,
  },
  {
    title: 'Collapsible Sidebar',
    code: `const [collapsed, setCollapsed] = useState(false)

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: BarChart },
]

<Sidebar 
  items={sidebarItems} 
  collapsed={collapsed}
  onCollapseToggle={() => setCollapsed(!collapsed)}
/>`,
    component: <CollapsibleExample />,
  },
  {
    title: 'Nested Items',
    code: `const [expandedItems, setExpandedItems] = useState(['products'])

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { 
    label: 'Products', 
    icon: ShoppingCart,
    expanded: expandedItems.includes('products'),
    onToggle: () => toggleExpanded('products'),
    children: [
      { label: 'All Products', href: '/products' },
      { label: 'Categories', href: '/products/categories' },
      { label: 'Inventory', href: '/products/inventory' },
      { label: 'Add New', href: '/products/new' },
    ]
  },
  { label: 'Analytics', href: '/analytics', icon: BarChart },
]

<Sidebar items={sidebarItems} />`,
    component: <NestedItemsExample />,
  },
  {
    title: 'With Header & Footer',
    code: `const header = (
  <div className="p-4 border-b border-gray-200">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
        A
      </div>
      <div>
        <h3 className="font-semibold">Acme Inc</h3>
        <p className="text-sm text-gray-500">Enterprise</p>
      </div>
    </div>
  </div>
)

const footer = (
  <div className="p-4 border-t border-gray-200">
    <div className="flex items-center gap-3 mb-3">
      <Avatar size="sm" name="John Doe" />
      <div>
        <p className="text-sm font-medium">John Doe</p>
        <p className="text-xs text-gray-500">john@acme.com</p>
      </div>
    </div>
    <button className="flex items-center gap-2 text-sm text-gray-600">
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  </div>
)

<Sidebar 
  items={sidebarItems} 
  header={header}
  footer={footer}
/>`,
    component: <WithHeaderFooterExample />,
  },
  {
    title: 'Sidebar Variants',
    code: `// Default variant
<Sidebar items={sidebarItems} />

// Dark variant
<Sidebar items={sidebarItems} variant="dark" />

// Bordered variant
<Sidebar items={sidebarItems} variant="bordered" />`,
    component: <VariantsExample />,
  },
  {
    title: 'With Search',
    code: `const [searchQuery, setSearchQuery] = useState('')

const filteredItems = sidebarItems.filter(item => 
  item.label.toLowerCase().includes(searchQuery.toLowerCase())
)

const searchBar = (
  <div className="p-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Search navigation..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg"
      />
    </div>
  </div>
)

<Sidebar 
  items={filteredItems} 
  header={searchBar}
/>`,
    component: <WithSearchExample />,
  },
  {
    title: 'Mobile Responsive',
    code: `const [mobileOpen, setMobileOpen] = useState(false)

// Mobile toggle button
<button
  onClick={() => setMobileOpen(!mobileOpen)}
  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
>
  <Menu className="w-6 h-6" />
</button>

// Mobile overlay
{mobileOpen && (
  <div 
    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
    onClick={() => setMobileOpen(false)}
  />
)}

// Sidebar with mobile styles
<div className={\`
  \${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
  md:translate-x-0 md:relative fixed inset-y-0 left-0 z-50
  transform transition-transform duration-300
\`}>
  <Sidebar 
    items={sidebarItems}
    onItemClick={() => setMobileOpen(false)}
  />
</div>`,
    component: <MobileResponsiveExample />,
  },
]

export default function SidebarPage() {
  return (
    <ComponentLayout
      title="Sidebar"
      description="A vertical navigation component that provides secondary navigation, typically used in dashboards and admin interfaces with support for nested items and collapsing."
      examples={examples}
    />
  )
}