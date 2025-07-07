import { List } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { User, Mail, Phone, MapPin, Calendar, Star, ChevronRight, MoreHorizontal } from 'lucide-react'

const BasicExample = () => {
  const items = [
    { id: '1', title: 'First Item', description: 'This is the first item in the list' },
    { id: '2', title: 'Second Item', description: 'This is the second item in the list' },
    { id: '3', title: 'Third Item', description: 'This is the third item in the list' },
    { id: '4', title: 'Fourth Item', description: 'This is the fourth item in the list' },
  ]

  return <List items={items} />
}

const WithIconsExample = () => {
  const items = [
    { 
      id: '1', 
      title: 'Profile Settings', 
      description: 'Manage your account information and preferences',
      icon: User 
    },
    { 
      id: '2', 
      title: 'Email Notifications', 
      description: 'Configure how you receive email updates',
      icon: Mail 
    },
    { 
      id: '3', 
      title: 'Phone Verification', 
      description: 'Add and verify your phone number',
      icon: Phone 
    },
    { 
      id: '4', 
      title: 'Location Services', 
      description: 'Control location-based features',
      icon: MapPin 
    },
  ]

  return <List items={items} />
}

const VariantsExample = () => {
  const items = [
    { id: '1', title: 'Default Item', description: 'Standard list item styling' },
    { id: '2', title: 'Another Item', description: 'More content here' },
    { id: '3', title: 'Third Item', description: 'Even more content' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Default Variant</h4>
        <List items={items} />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Bordered Variant</h4>
        <List items={items} variant="bordered" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Divided Variant</h4>
        <List items={items} variant="divided" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Card Variant</h4>
        <List items={items} variant="card" />
      </div>
    </div>
  )
}

const SizesExample = () => {
  const items = [
    { id: '1', title: 'Sample Item', description: 'This is a sample description' },
    { id: '2', title: 'Another Item', description: 'Another sample description' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Small</h4>
        <List items={items} size="sm" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Medium (Default)</h4>
        <List items={items} size="md" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Large</h4>
        <List items={items} size="lg" />
      </div>
    </div>
  )
}

const InteractiveExample = () => {
  const items = [
    { 
      id: '1', 
      title: 'Dashboard', 
      description: 'View your main dashboard',
      icon: User,
      href: '/dashboard'
    },
    { 
      id: '2', 
      title: 'Settings', 
      description: 'Manage your account settings',
      icon: User,
      onClick: () => console.log('Settings clicked')
    },
    { 
      id: '3', 
      title: 'Profile', 
      description: 'Edit your profile information',
      icon: User,
      onClick: () => console.log('Profile clicked')
    },
  ]

  return <List items={items} />
}

const WithActionsExample = () => {
  const items = [
    { 
      id: '1', 
      title: 'John Doe', 
      description: 'john@example.com • Last active 2 hours ago',
      icon: User,
      actions: (
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Mail className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )
    },
    { 
      id: '2', 
      title: 'Jane Smith', 
      description: 'jane@example.com • Last active 1 day ago',
      icon: User,
      actions: (
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Mail className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )
    },
    { 
      id: '3', 
      title: 'Bob Johnson', 
      description: 'bob@example.com • Last active 1 week ago',
      icon: User,
      actions: (
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Mail className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )
    },
  ]

  return <List items={items} />
}

const CustomContentExample = () => {
  const items = [
    { 
      id: '1',
      render: () => (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Team Meeting</h3>
              <p className="text-sm text-gray-500">Today at 2:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Confirmed
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )
    },
    { 
      id: '2',
      render: () => (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Project Review</h3>
              <p className="text-sm text-gray-500">Tomorrow at 10:00 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              Pending
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )
    },
    { 
      id: '3',
      render: () => (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Client Presentation</h3>
              <p className="text-sm text-gray-500">Friday at 3:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Urgent
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )
    },
  ]

  return <List items={items} />
}

const EmptyStateExample = () => {
  return (
    <List 
      items={[]} 
      emptyState={{
        title: 'No items found',
        description: 'There are no items to display in this list.',
        action: (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Item
          </button>
        )
      }}
    />
  )
}

const LoadingExample = () => {
  const items = [
    { id: '1', title: 'Loading Item', description: 'This will show skeleton loading' },
    { id: '2', title: 'Another Item', description: 'Another loading item' },
    { id: '3', title: 'Third Item', description: 'Third loading item' },
  ]

  return <List items={items} loading />
}

const examples = [
  {
    title: 'Basic List',
    code: `const items = [
  { id: '1', title: 'First Item', description: 'This is the first item' },
  { id: '2', title: 'Second Item', description: 'This is the second item' },
  { id: '3', title: 'Third Item', description: 'This is the third item' },
]

<List items={items} />`,
    component: <BasicExample />,
  },
  {
    title: 'With Icons',
    code: `import { User, Mail, Phone, MapPin } from 'lucide-react'

const items = [
  { 
    id: '1', 
    title: 'Profile Settings', 
    description: 'Manage your account information',
    icon: User 
  },
  { 
    id: '2', 
    title: 'Email Notifications', 
    description: 'Configure email updates',
    icon: Mail 
  },
  { 
    id: '3', 
    title: 'Phone Verification', 
    description: 'Add and verify your phone',
    icon: Phone 
  },
]

<List items={items} />`,
    component: <WithIconsExample />,
  },
  {
    title: 'List Variants',
    code: `const items = [
  { id: '1', title: 'Item 1', description: 'Description' },
  { id: '2', title: 'Item 2', description: 'Description' },
]

<List items={items} />
<List items={items} variant="bordered" />
<List items={items} variant="divided" />
<List items={items} variant="card" />`,
    component: <VariantsExample />,
  },
  {
    title: 'Different Sizes',
    code: `const items = [
  { id: '1', title: 'Sample Item', description: 'Description' },
  { id: '2', title: 'Another Item', description: 'Description' },
]

<List items={items} size="sm" />
<List items={items} size="md" />
<List items={items} size="lg" />`,
    component: <SizesExample />,
  },
  {
    title: 'Interactive List',
    code: `const items = [
  { 
    id: '1', 
    title: 'Dashboard', 
    description: 'View your main dashboard',
    icon: User,
    href: '/dashboard'
  },
  { 
    id: '2', 
    title: 'Settings', 
    description: 'Manage account settings',
    icon: User,
    onClick: () => console.log('Settings clicked')
  },
]

<List items={items} />`,
    component: <InteractiveExample />,
  },
  {
    title: 'With Actions',
    code: `const items = [
  { 
    id: '1', 
    title: 'John Doe', 
    description: 'john@example.com • Last active 2 hours ago',
    icon: User,
    actions: (
      <div className="flex items-center gap-1">
        <button className="p-1 hover:bg-gray-100 rounded">
          <Mail className="w-4 h-4 text-gray-500" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    )
  },
]

<List items={items} />`,
    component: <WithActionsExample />,
  },
  {
    title: 'Custom Content',
    code: `const items = [
  { 
    id: '1',
    render: () => (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Team Meeting</h3>
            <p className="text-sm text-gray-500">Today at 2:00 PM</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Confirmed
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    )
  },
]

<List items={items} />`,
    component: <CustomContentExample />,
  },
  {
    title: 'Empty State',
    code: `<List 
  items={[]} 
  emptyState={{
    title: 'No items found',
    description: 'There are no items to display in this list.',
    action: (
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
        Add Item
      </button>
    )
  }}
/>`,
    component: <EmptyStateExample />,
  },
  {
    title: 'Loading State',
    code: `const items = [
  { id: '1', title: 'Loading Item', description: 'This will show skeleton' },
  { id: '2', title: 'Another Item', description: 'Another loading item' },
]

<List items={items} loading />`,
    component: <LoadingExample />,
  },
]

export default function ListPage() {
  return (
    <ComponentLayout
      title="List"
      description="A flexible list component for displaying collections of related content with support for icons, actions, custom rendering, and various styling options."
      examples={examples}
    />
  )
}