import { Navbar, Button, Avatar } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import { Menu, X, Bell, Search, Settings, User, LogOut, Home, FileText, Users, BarChart } from 'lucide-react'

const BasicExample = () => {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <Navbar
      brand={{ name: 'MyApp', href: '/' }}
      items={navItems}
    />
  )
}

const WithLogoExample = () => {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs' },
  ]

  return (
    <Navbar
      brand={{ 
        name: 'MyApp', 
        href: '/',
        logo: (
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            M
          </div>
        )
      }}
      items={navItems}
    />
  )
}

const WithActionsExample = () => {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
  ]

  const actions = (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" icon={Search}>
        Search
      </Button>
      <Button variant="outline" size="sm">
        Sign In
      </Button>
      <Button variant="primary" size="sm">
        Get Started
      </Button>
    </div>
  )

  return (
    <Navbar
      brand={{ name: 'MyApp', href: '/' }}
      items={navItems}
      actions={actions}
    />
  )
}

const WithUserMenuExample = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/projects' },
    { label: 'Team', href: '/team' },
  ]

  const userMenu = (
    <div className="relative">
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100"
      >
        <Avatar size="sm" name="John Doe" />
        <span className="text-sm font-medium">John Doe</span>
      </button>
      
      {userMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          <a href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <User className="w-4 h-4" />
            Profile
          </a>
          <a href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Settings className="w-4 h-4" />
            Settings
          </a>
          <hr className="my-1" />
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )

  const actions = (
    <div className="flex items-center gap-3">
      <button className="p-2 hover:bg-gray-100 rounded-lg">
        <Bell className="w-5 h-5 text-gray-600" />
      </button>
      {userMenu}
    </div>
  )

  return (
    <Navbar
      brand={{ name: 'Dashboard', href: '/dashboard' }}
      items={navItems}
      actions={actions}
    />
  )
}

const VariantsExample = () => {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Default Variant</h4>
        <Navbar
          brand={{ name: 'Default', href: '/' }}
          items={navItems}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Dark Variant</h4>
        <Navbar
          variant="dark"
          brand={{ name: 'Dark', href: '/' }}
          items={navItems}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Transparent Variant</h4>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-0 rounded">
          <Navbar
            variant="transparent"
            brand={{ name: 'Transparent', href: '/' }}
            items={navItems}
          />
        </div>
      </div>
    </div>
  )
}

const StickyExample = () => {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <div className="relative h-96 overflow-y-auto bg-gray-50 rounded">
      <Navbar
        sticky
        brand={{ name: 'Sticky Nav', href: '/' }}
        items={navItems}
      />
      <div className="p-8">
        <h3 className="text-lg font-medium mb-4">Scroll to see sticky navbar</h3>
        <p className="text-gray-600 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p className="text-gray-600 mb-4">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p className="text-gray-600 mb-4">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <p className="text-gray-600 mb-4">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <p className="text-gray-600 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p className="text-gray-600 mb-4">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </div>
    </div>
  )
}

const MobileResponsiveExample = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Products', href: '/products', icon: FileText },
    { label: 'Team', href: '/team', icon: Users },
    { label: 'Analytics', href: '/analytics', icon: BarChart },
  ]

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Navbar
        brand={{ name: 'Mobile First', href: '/' }}
        items={navItems}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        actions={
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm">Sign In</Button>
            <Button variant="primary" size="sm">Sign Up</Button>
          </div>
        }
      />
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon && <item.icon className="w-5 h-5 text-gray-600" />}
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="p-4 pt-0 space-y-2">
            <Button variant="outline" className="w-full">Sign In</Button>
            <Button variant="primary" className="w-full">Sign Up</Button>
          </div>
        </div>
      )}
    </div>
  )
}

const ComplexExample = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { 
      label: 'Products', 
      href: '/products',
      children: [
        { label: 'All Products', href: '/products/all' },
        { label: 'Categories', href: '/products/categories' },
        { label: 'Featured', href: '/products/featured' },
        { label: 'New Arrivals', href: '/products/new' },
      ]
    },
    { 
      label: 'Solutions', 
      href: '/solutions',
      children: [
        { label: 'For Startups', href: '/solutions/startups' },
        { label: 'For Enterprise', href: '/solutions/enterprise' },
        { label: 'For Developers', href: '/solutions/developers' },
      ]
    },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs' },
  ]

  return (
    <Navbar
      brand={{ 
        name: 'Enterprise App', 
        href: '/',
        logo: (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            EA
          </div>
        )
      }}
      items={navItems}
      mobileMenuOpen={mobileMenuOpen}
      onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      actions={
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">Sign In</Button>
            <Button variant="primary" size="sm">Get Started</Button>
          </div>
        </div>
      }
    />
  )
}

const examples = [
  {
    title: 'Basic Navbar',
    code: `const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

<Navbar
  brand={{ name: 'MyApp', href: '/' }}
  items={navItems}
/>`,
    component: <BasicExample />,
  },
  {
    title: 'With Logo',
    code: `const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
]

<Navbar
  brand={{ 
    name: 'MyApp', 
    href: '/',
    logo: (
      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
        M
      </div>
    )
  }}
  items={navItems}
/>`,
    component: <WithLogoExample />,
  },
  {
    title: 'With Actions',
    code: `const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
]

const actions = (
  <div className="flex items-center gap-3">
    <Button variant="ghost" size="sm" icon={Search}>
      Search
    </Button>
    <Button variant="outline" size="sm">
      Sign In
    </Button>
    <Button variant="primary" size="sm">
      Get Started
    </Button>
  </div>
)

<Navbar
  brand={{ name: 'MyApp', href: '/' }}
  items={navItems}
  actions={actions}
/>`,
    component: <WithActionsExample />,
  },
  {
    title: 'With User Menu',
    code: `const [userMenuOpen, setUserMenuOpen] = useState(false)

const userMenu = (
  <div className="relative">
    <button
      onClick={() => setUserMenuOpen(!userMenuOpen)}
      className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100"
    >
      <Avatar size="sm" name="John Doe" />
      <span className="text-sm font-medium">John Doe</span>
    </button>
    
    {userMenuOpen && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
        <a href="/profile" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100">
          <User className="w-4 h-4" />
          Profile
        </a>
        <a href="/settings" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100">
          <Settings className="w-4 h-4" />
          Settings
        </a>
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    )}
  </div>
)

<Navbar
  brand={{ name: 'Dashboard', href: '/dashboard' }}
  items={navItems}
  actions={actions}
/>`,
    component: <WithUserMenuExample />,
  },
  {
    title: 'Navbar Variants',
    code: `// Default variant
<Navbar
  brand={{ name: 'Default', href: '/' }}
  items={navItems}
/>

// Dark variant
<Navbar
  variant="dark"
  brand={{ name: 'Dark', href: '/' }}
  items={navItems}
/>

// Transparent variant (for hero sections)
<Navbar
  variant="transparent"
  brand={{ name: 'Transparent', href: '/' }}
  items={navItems}
/>`,
    component: <VariantsExample />,
  },
  {
    title: 'Sticky Navbar',
    code: `<Navbar
  sticky
  brand={{ name: 'Sticky Nav', href: '/' }}
  items={navItems}
/>

// The navbar will stick to the top when scrolling`,
    component: <StickyExample />,
  },
  {
    title: 'Mobile Responsive',
    code: `const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Products', href: '/products', icon: FileText },
  { label: 'Team', href: '/team', icon: Users },
]

<Navbar
  brand={{ name: 'Mobile First', href: '/' }}
  items={navItems}
  mobileMenuOpen={mobileMenuOpen}
  onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
  actions={
    <div className="hidden md:flex items-center gap-3">
      <Button variant="outline" size="sm">Sign In</Button>
      <Button variant="primary" size="sm">Sign Up</Button>
    </div>
  }
/>

{/* Mobile Menu */}
{mobileMenuOpen && (
  <div className="md:hidden bg-white border-t">
    <nav className="p-4 space-y-2">
      {navItems.map((item) => (
        <a href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
          {item.icon && <item.icon className="w-5 h-5" />}
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  </div>
)}`,
    component: <MobileResponsiveExample />,
  },
  {
    title: 'Complex Navigation',
    code: `const navItems = [
  { 
    label: 'Products', 
    href: '/products',
    children: [
      { label: 'All Products', href: '/products/all' },
      { label: 'Categories', href: '/products/categories' },
      { label: 'Featured', href: '/products/featured' },
    ]
  },
  { 
    label: 'Solutions', 
    href: '/solutions',
    children: [
      { label: 'For Startups', href: '/solutions/startups' },
      { label: 'For Enterprise', href: '/solutions/enterprise' },
    ]
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
]

<Navbar
  brand={{ 
    name: 'Enterprise App', 
    href: '/',
    logo: <Logo />
  }}
  items={navItems}
  actions={
    <div className="flex items-center gap-4">
      <Search />
      <Notifications />
      <UserMenu />
    </div>
  }
/>`,
    component: <ComplexExample />,
  },
]

export default function NavbarPage() {
  return (
    <ComponentLayout
      title="Navbar"
      description="A top navigation bar component that provides primary navigation, branding, and user actions with responsive mobile menu support."
      examples={examples}
    />
  )
}