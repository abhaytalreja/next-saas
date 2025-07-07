import { Menu, Button } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import { 
  MoreHorizontal, MoreVertical, ChevronDown, User, Settings, 
  LogOut, Edit, Trash, Copy, Share, Download, Star, Heart
} from 'lucide-react'

const BasicExample = () => {
  const menuItems = [
    { label: 'Edit', onClick: () => console.log('Edit clicked') },
    { label: 'Duplicate', onClick: () => console.log('Duplicate clicked') },
    { label: 'Share', onClick: () => console.log('Share clicked') },
    { label: 'Delete', onClick: () => console.log('Delete clicked') },
  ]

  return (
    <Menu
      trigger={
        <Button variant="outline">
          Options <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      }
      items={menuItems}
    />
  )
}

const WithIconsExample = () => {
  const menuItems = [
    { label: 'Edit', icon: Edit, onClick: () => console.log('Edit') },
    { label: 'Copy', icon: Copy, onClick: () => console.log('Copy') },
    { label: 'Share', icon: Share, onClick: () => console.log('Share') },
    { type: 'separator' as const },
    { label: 'Delete', icon: Trash, onClick: () => console.log('Delete'), destructive: true },
  ]

  return (
    <Menu
      trigger={
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      }
      items={menuItems}
    />
  )
}

const NestedMenuExample = () => {
  const menuItems = [
    { label: 'New File', onClick: () => console.log('New File') },
    { label: 'Open', onClick: () => console.log('Open') },
    { 
      label: 'Recent Files',
      children: [
        { label: 'document-1.pdf', onClick: () => console.log('document-1.pdf') },
        { label: 'report-2023.xlsx', onClick: () => console.log('report-2023.xlsx') },
        { label: 'presentation.pptx', onClick: () => console.log('presentation.pptx') },
      ]
    },
    { type: 'separator' as const },
    {
      label: 'Export As',
      children: [
        { label: 'PDF', onClick: () => console.log('Export PDF') },
        { label: 'CSV', onClick: () => console.log('Export CSV') },
        { label: 'JSON', onClick: () => console.log('Export JSON') },
      ]
    },
  ]

  return (
    <Menu
      trigger={
        <Button variant="outline">
          File Menu <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      }
      items={menuItems}
    />
  )
}

const PositionsExample = () => {
  const menuItems = [
    { label: 'Option 1', onClick: () => {} },
    { label: 'Option 2', onClick: () => {} },
    { label: 'Option 3', onClick: () => {} },
  ]

  return (
    <div className="flex gap-4 flex-wrap">
      <Menu
        trigger={<Button variant="outline" size="sm">Bottom Right</Button>}
        items={menuItems}
        position="bottom-right"
      />
      <Menu
        trigger={<Button variant="outline" size="sm">Bottom Left</Button>}
        items={menuItems}
        position="bottom-left"
      />
      <Menu
        trigger={<Button variant="outline" size="sm">Top Right</Button>}
        items={menuItems}
        position="top-right"
      />
      <Menu
        trigger={<Button variant="outline" size="sm">Top Left</Button>}
        items={menuItems}
        position="top-left"
      />
    </div>
  )
}

const CustomItemsExample = () => {
  const [starred, setStarred] = useState(false)
  const [favorited, setFavorited] = useState(false)

  const menuItems = [
    {
      render: () => (
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900">John Doe</p>
          <p className="text-xs text-gray-500">john.doe@example.com</p>
        </div>
      )
    },
    { type: 'separator' as const },
    {
      label: 'Star',
      icon: Star,
      onClick: () => setStarred(!starred),
      render: (item: any) => (
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100"
          onClick={item.onClick}
        >
          <Star className={`h-4 w-4 ${starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          {item.label}
        </button>
      )
    },
    {
      label: 'Favorite',
      icon: Heart,
      onClick: () => setFavorited(!favorited),
      render: (item: any) => (
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100"
          onClick={item.onClick}
        >
          <Heart className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
          {item.label}
        </button>
      )
    },
    { type: 'separator' as const },
    { label: 'Profile', icon: User, onClick: () => console.log('Profile') },
    { label: 'Settings', icon: Settings, onClick: () => console.log('Settings') },
    { type: 'separator' as const },
    { label: 'Sign Out', icon: LogOut, onClick: () => console.log('Sign Out'), destructive: true },
  ]

  return (
    <Menu
      trigger={
        <Button variant="outline">
          User Menu <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      }
      items={menuItems}
    />
  )
}

const DisabledItemsExample = () => {
  const menuItems = [
    { label: 'Cut', onClick: () => console.log('Cut') },
    { label: 'Copy', onClick: () => console.log('Copy') },
    { label: 'Paste', onClick: () => console.log('Paste'), disabled: true },
    { type: 'separator' as const },
    { label: 'Select All', onClick: () => console.log('Select All') },
    { label: 'Find', onClick: () => console.log('Find'), disabled: true },
  ]

  return (
    <Menu
      trigger={
        <Button variant="outline">
          Edit Menu <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      }
      items={menuItems}
    />
  )
}

const WithDescriptionsExample = () => {
  const menuItems = [
    { 
      label: 'Download', 
      icon: Download,
      description: 'Save file to your device',
      onClick: () => console.log('Download') 
    },
    { 
      label: 'Share', 
      icon: Share,
      description: 'Share with others',
      onClick: () => console.log('Share') 
    },
    { type: 'separator' as const },
    { 
      label: 'Delete', 
      icon: Trash,
      description: 'Permanently remove',
      onClick: () => console.log('Delete'),
      destructive: true
    },
  ]

  return (
    <Menu
      trigger={
        <Button variant="outline">
          Actions <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      }
      items={menuItems}
    />
  )
}

const ControlledExample = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [lastAction, setLastAction] = useState('')

  const menuItems = [
    { 
      label: 'Action 1', 
      onClick: () => {
        setLastAction('Action 1 clicked')
        setIsOpen(false)
      }
    },
    { 
      label: 'Action 2', 
      onClick: () => {
        setLastAction('Action 2 clicked')
        setIsOpen(false)
      }
    },
    { 
      label: 'Keep Open', 
      onClick: () => {
        setLastAction('This keeps the menu open')
        // Don't close the menu
      }
    },
  ]

  return (
    <div className="space-y-4">
      <Menu
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <Button variant="outline">
            Controlled Menu <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        }
        items={menuItems}
      />
      {lastAction && (
        <p className="text-sm text-gray-600">Last action: {lastAction}</p>
      )}
    </div>
  )
}

const examples = [
  {
    title: 'Basic Menu',
    code: `const menuItems = [
  { label: 'Edit', onClick: () => console.log('Edit clicked') },
  { label: 'Duplicate', onClick: () => console.log('Duplicate clicked') },
  { label: 'Share', onClick: () => console.log('Share clicked') },
  { label: 'Delete', onClick: () => console.log('Delete clicked') },
]

<Menu
  trigger={
    <Button variant="outline">
      Options <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  }
  items={menuItems}
/>`,
    component: <BasicExample />,
  },
  {
    title: 'With Icons',
    code: `const menuItems = [
  { label: 'Edit', icon: Edit, onClick: () => console.log('Edit') },
  { label: 'Copy', icon: Copy, onClick: () => console.log('Copy') },
  { label: 'Share', icon: Share, onClick: () => console.log('Share') },
  { type: 'separator' },
  { label: 'Delete', icon: Trash, onClick: () => console.log('Delete'), destructive: true },
]

<Menu
  trigger={
    <button className="p-2 hover:bg-gray-100 rounded-lg">
      <MoreHorizontal className="h-5 w-5" />
    </button>
  }
  items={menuItems}
/>`,
    component: <WithIconsExample />,
  },
  {
    title: 'Nested Menus',
    code: `const menuItems = [
  { label: 'New File', onClick: () => console.log('New File') },
  { label: 'Open', onClick: () => console.log('Open') },
  { 
    label: 'Recent Files',
    children: [
      { label: 'document-1.pdf', onClick: () => console.log('document-1.pdf') },
      { label: 'report-2023.xlsx', onClick: () => console.log('report-2023.xlsx') },
      { label: 'presentation.pptx', onClick: () => console.log('presentation.pptx') },
    ]
  },
  { type: 'separator' },
  {
    label: 'Export As',
    children: [
      { label: 'PDF', onClick: () => console.log('Export PDF') },
      { label: 'CSV', onClick: () => console.log('Export CSV') },
      { label: 'JSON', onClick: () => console.log('Export JSON') },
    ]
  },
]

<Menu trigger={<Button>File Menu</Button>} items={menuItems} />`,
    component: <NestedMenuExample />,
  },
  {
    title: 'Menu Positions',
    code: `<Menu
  trigger={<Button>Bottom Right</Button>}
  items={menuItems}
  position="bottom-right"
/>

<Menu
  trigger={<Button>Bottom Left</Button>}
  items={menuItems}
  position="bottom-left"
/>

<Menu
  trigger={<Button>Top Right</Button>}
  items={menuItems}
  position="top-right"
/>

<Menu
  trigger={<Button>Top Left</Button>}
  items={menuItems}
  position="top-left"
/>`,
    component: <PositionsExample />,
  },
  {
    title: 'Custom Items',
    code: `const [starred, setStarred] = useState(false)

const menuItems = [
  {
    render: () => (
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-gray-900">John Doe</p>
        <p className="text-xs text-gray-500">john.doe@example.com</p>
      </div>
    )
  },
  { type: 'separator' },
  {
    label: 'Star',
    icon: Star,
    onClick: () => setStarred(!starred),
    render: (item) => (
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100"
        onClick={item.onClick}
      >
        <Star className={\`h-4 w-4 \${starred ? 'fill-yellow-400 text-yellow-400' : ''}\`} />
        {item.label}
      </button>
    )
  },
  { type: 'separator' },
  { label: 'Sign Out', icon: LogOut, onClick: () => console.log('Sign Out'), destructive: true },
]

<Menu trigger={<Button>User Menu</Button>} items={menuItems} />`,
    component: <CustomItemsExample />,
  },
  {
    title: 'Disabled Items',
    code: `const menuItems = [
  { label: 'Cut', onClick: () => console.log('Cut') },
  { label: 'Copy', onClick: () => console.log('Copy') },
  { label: 'Paste', onClick: () => console.log('Paste'), disabled: true },
  { type: 'separator' },
  { label: 'Select All', onClick: () => console.log('Select All') },
  { label: 'Find', onClick: () => console.log('Find'), disabled: true },
]

<Menu trigger={<Button>Edit Menu</Button>} items={menuItems} />`,
    component: <DisabledItemsExample />,
  },
  {
    title: 'With Descriptions',
    code: `const menuItems = [
  { 
    label: 'Download', 
    icon: Download,
    description: 'Save file to your device',
    onClick: () => console.log('Download') 
  },
  { 
    label: 'Share', 
    icon: Share,
    description: 'Share with others',
    onClick: () => console.log('Share') 
  },
  { type: 'separator' },
  { 
    label: 'Delete', 
    icon: Trash,
    description: 'Permanently remove',
    onClick: () => console.log('Delete'),
    destructive: true
  },
]

<Menu trigger={<Button>Actions</Button>} items={menuItems} />`,
    component: <WithDescriptionsExample />,
  },
  {
    title: 'Controlled Menu',
    code: `const [isOpen, setIsOpen] = useState(false)
const [lastAction, setLastAction] = useState('')

const menuItems = [
  { 
    label: 'Action 1', 
    onClick: () => {
      setLastAction('Action 1 clicked')
      setIsOpen(false)
    }
  },
  { 
    label: 'Keep Open', 
    onClick: () => {
      setLastAction('This keeps the menu open')
      // Don't close the menu
    }
  },
]

<Menu
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  trigger={<Button>Controlled Menu</Button>}
  items={menuItems}
/>`,
    component: <ControlledExample />,
  },
]

export default function MenuPage() {
  return (
    <ComponentLayout
      title="Menu"
      description="A dropdown menu component that displays a list of actions or options, with support for icons, nested items, separators, and custom content."
      examples={examples}
    />
  )
}