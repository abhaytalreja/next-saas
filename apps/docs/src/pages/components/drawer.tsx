import { Drawer, Button } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import { X, Settings, Menu, User, Bell, Search } from 'lucide-react'

const BasicExample = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Drawer
      </Button>
      
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Drawer Title</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            This is a basic drawer component that slides in from the side. 
            It's perfect for navigation menus, settings panels, or additional content.
          </p>
          
          <div className="space-y-4">
            <Button variant="outline" className="w-full">
              Action 1
            </Button>
            <Button variant="outline" className="w-full">
              Action 2
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}

const PositionsExample = () => {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null)

  const positions = [
    { position: 'left' as const, label: 'Left' },
    { position: 'right' as const, label: 'Right' },
    { position: 'top' as const, label: 'Top' },
    { position: 'bottom' as const, label: 'Bottom' }
  ]

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {positions.map(({ position, label }) => (
          <Button key={position} onClick={() => setOpenDrawer(position)}>
            {label} Drawer
          </Button>
        ))}
      </div>
      
      {positions.map(({ position, label }) => (
        <Drawer
          key={position}
          position={position}
          isOpen={openDrawer === position}
          onClose={() => setOpenDrawer(null)}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{label} Drawer</h3>
              <button 
                onClick={() => setOpenDrawer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600">
              This drawer slides in from the {position} side of the screen.
            </p>
          </div>
        </Drawer>
      ))}
    </>
  )
}

const SizesExample = () => {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null)

  const sizes = [
    { size: 'sm' as const, label: 'Small' },
    { size: 'md' as const, label: 'Medium' },
    { size: 'lg' as const, label: 'Large' },
    { size: 'xl' as const, label: 'Extra Large' },
    { size: 'full' as const, label: 'Full Width' }
  ]

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {sizes.map(({ size, label }) => (
          <Button key={size} onClick={() => setOpenDrawer(size)}>
            {label} Drawer
          </Button>
        ))}
      </div>
      
      {sizes.map(({ size, label }) => (
        <Drawer
          key={size}
          size={size}
          isOpen={openDrawer === size}
          onClose={() => setOpenDrawer(null)}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{label} Drawer</h3>
              <button 
                onClick={() => setOpenDrawer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600">
              This is a {label.toLowerCase()} drawer. The size affects the width (for left/right) 
              or height (for top/bottom) of the drawer.
            </p>
          </div>
        </Drawer>
      ))}
    </>
  )
}

const NavigationExample = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: Search, label: 'Search', href: '/search' },
  ]

  return (
    <>
      <Button onClick={() => setIsOpen(true)} icon={Menu}>
        Open Navigation
      </Button>
      
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} position="left">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Navigation</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-6 border-t border-gray-200">
            <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
              Sign Out
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}

const FormDrawerExample = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    bio: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setIsOpen(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Add User
      </Button>
      
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a brief bio..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add User
              </Button>
            </div>
          </form>
        </div>
      </Drawer>
    </>
  )
}

const OverlayExample = () => {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null)

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setOpenDrawer('overlay')}>
          With Overlay
        </Button>
        <Button onClick={() => setOpenDrawer('no-overlay')}>
          No Overlay
        </Button>
        <Button onClick={() => setOpenDrawer('custom-overlay')}>
          Custom Overlay
        </Button>
      </div>
      
      <Drawer
        isOpen={openDrawer === 'overlay'}
        onClose={() => setOpenDrawer(null)}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">With Overlay</h3>
          <p className="text-gray-600">
            This drawer has the default overlay that darkens the background.
          </p>
        </div>
      </Drawer>
      
      <Drawer
        isOpen={openDrawer === 'no-overlay'}
        onClose={() => setOpenDrawer(null)}
        showOverlay={false}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">No Overlay</h3>
          <p className="text-gray-600">
            This drawer has no overlay, so the background remains visible and interactive.
          </p>
        </div>
      </Drawer>
      
      <Drawer
        isOpen={openDrawer === 'custom-overlay'}
        onClose={() => setOpenDrawer(null)}
        overlayClassName="bg-blue-900 bg-opacity-50"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Overlay</h3>
          <p className="text-gray-600">
            This drawer has a custom blue-tinted overlay.
          </p>
        </div>
      </Drawer>
    </>
  )
}

const examples = [
  {
    title: 'Basic Drawer',
    code: `const [isOpen, setIsOpen] = useState(false)

<>
  <Button onClick={() => setIsOpen(true)}>
    Open Drawer
  </Button>
  
  <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Drawer Title</h2>
        <button onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-gray-600 mb-6">
        This is a basic drawer component that slides in from the side.
      </p>
      
      <div className="space-y-4">
        <Button variant="outline" className="w-full">Action 1</Button>
        <Button variant="outline" className="w-full">Action 2</Button>
      </div>
    </div>
  </Drawer>
</>`,
    component: <BasicExample />,
  },
  {
    title: 'Different Positions',
    code: `const [openDrawer, setOpenDrawer] = useState(null)

<>
  <Button onClick={() => setOpenDrawer('left')}>Left Drawer</Button>
  <Button onClick={() => setOpenDrawer('right')}>Right Drawer</Button>
  <Button onClick={() => setOpenDrawer('top')}>Top Drawer</Button>
  <Button onClick={() => setOpenDrawer('bottom')}>Bottom Drawer</Button>
  
  <Drawer
    position="left"
    isOpen={openDrawer === 'left'}
    onClose={() => setOpenDrawer(null)}
  >
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Left Drawer</h3>
      <p className="text-gray-600">This drawer slides in from the left side.</p>
    </div>
  </Drawer>
</>`,
    component: <PositionsExample />,
  },
  {
    title: 'Different Sizes',
    code: `const [openDrawer, setOpenDrawer] = useState(null)

<>
  <Button onClick={() => setOpenDrawer('sm')}>Small</Button>
  <Button onClick={() => setOpenDrawer('md')}>Medium</Button>
  <Button onClick={() => setOpenDrawer('lg')}>Large</Button>
  <Button onClick={() => setOpenDrawer('xl')}>Extra Large</Button>
  <Button onClick={() => setOpenDrawer('full')}>Full Width</Button>
  
  <Drawer
    size="lg"
    isOpen={openDrawer === 'lg'}
    onClose={() => setOpenDrawer(null)}
  >
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Large Drawer</h3>
      <p className="text-gray-600">This is a large drawer with more space.</p>
    </div>
  </Drawer>
</>`,
    component: <SizesExample />,
  },
  {
    title: 'Navigation Drawer',
    code: `const [isOpen, setIsOpen] = useState(false)

const navigationItems = [
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
]

<>
  <Button onClick={() => setIsOpen(true)} icon={Menu}>
    Open Navigation
  </Button>
  
  <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} position="left">
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Navigation</h2>
        <button onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="flex-1 p-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.label}>
              <a href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100">
                <item.icon className="w-5 h-5" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-6 border-t">
        <Button variant="outline" className="w-full">Sign Out</Button>
      </div>
    </div>
  </Drawer>
</>`,
    component: <NavigationExample />,
  },
  {
    title: 'Form Drawer',
    code: `const [isOpen, setIsOpen] = useState(false)
const [formData, setFormData] = useState({ name: '', email: '', role: '' })

const handleSubmit = (e) => {
  e.preventDefault()
  console.log('Form submitted:', formData)
  setIsOpen(false)
}

<>
  <Button onClick={() => setIsOpen(true)}>Add User</Button>
  
  <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
        <button onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add User
          </Button>
        </div>
      </form>
    </div>
  </Drawer>
</>`,
    component: <FormDrawerExample />,
  },
  {
    title: 'Overlay Options',
    code: `const [openDrawer, setOpenDrawer] = useState(null)

<>
  <Button onClick={() => setOpenDrawer('overlay')}>With Overlay</Button>
  <Button onClick={() => setOpenDrawer('no-overlay')}>No Overlay</Button>
  <Button onClick={() => setOpenDrawer('custom-overlay')}>Custom Overlay</Button>
  
  <Drawer
    isOpen={openDrawer === 'overlay'}
    onClose={() => setOpenDrawer(null)}
  >
    <div className="p-6">
      <h3>With Overlay</h3>
      <p>Default overlay that darkens the background.</p>
    </div>
  </Drawer>
  
  <Drawer
    isOpen={openDrawer === 'no-overlay'}
    onClose={() => setOpenDrawer(null)}
    showOverlay={false}
  >
    <div className="p-6">
      <h3>No Overlay</h3>
      <p>No overlay, background remains visible.</p>
    </div>
  </Drawer>
  
  <Drawer
    isOpen={openDrawer === 'custom-overlay'}
    onClose={() => setOpenDrawer(null)}
    overlayClassName="bg-blue-900 bg-opacity-50"
  >
    <div className="p-6">
      <h3>Custom Overlay</h3>
      <p>Custom blue-tinted overlay.</p>
    </div>
  </Drawer>
</>`,
    component: <OverlayExample />,
  },
]

export default function DrawerPage() {
  return (
    <ComponentLayout
      title="Drawer"
      description="A sliding panel component that appears from the edge of the screen, perfect for navigation menus, forms, or additional content without leaving the current page."
      examples={examples}
    />
  )
}