import { CommandPalette, Button } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import { Search, Home, Users, Settings, FileText, Plus, Mail } from 'lucide-react'

const BasicExample = () => {
  const [open, setOpen] = useState(false)

  const items = [
    {
      id: 'home',
      label: 'Go to Dashboard',
      description: 'Navigate to the main dashboard',
      icon: Home,
      category: 'navigation',
      onSelect: () => console.log('Navigate to dashboard'),
    },
    {
      id: 'users',
      label: 'Manage Users',
      description: 'View and edit user accounts',
      icon: Users,
      category: 'navigation',
      shortcut: ['⌘', 'U'],
      onSelect: () => console.log('Navigate to users'),
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure application settings',
      icon: Settings,
      category: 'navigation',
      shortcut: ['⌘', ','],
      onSelect: () => console.log('Navigate to settings'),
    },
    {
      id: 'create-post',
      label: 'Create New Post',
      description: 'Write a new blog post',
      icon: Plus,
      category: 'action',
      shortcut: ['⌘', 'N'],
      onSelect: () => console.log('Create new post'),
    },
    {
      id: 'send-email',
      label: 'Send Email',
      description: 'Compose and send an email',
      icon: Mail,
      category: 'action',
      onSelect: () => console.log('Send email'),
    },
  ]

  return (
    <div>
      <Button onClick={() => setOpen(true)}>
        Open Command Palette
      </Button>
      
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={items}
        placeholder="Type a command or search..."
      />
    </div>
  )
}

const WithGroupsExample = () => {
  const [open, setOpen] = useState(false)

  const groups = [
    {
      id: 'recent',
      label: 'Recent',
      priority: 1,
      items: [
        {
          id: 'recent-1',
          label: 'User Dashboard',
          description: 'Last visited 2 hours ago',
          icon: Users,
          onSelect: () => console.log('Navigate to recent'),
        },
      ],
    },
    {
      id: 'navigation',
      label: 'Navigation',
      priority: 2,
      items: [
        {
          id: 'nav-1',
          label: 'Dashboard',
          icon: Home,
          shortcut: ['⌘', 'H'],
          onSelect: () => console.log('Navigate to dashboard'),
        },
        {
          id: 'nav-2',
          label: 'Settings',
          icon: Settings,
          shortcut: ['⌘', ','],
          onSelect: () => console.log('Navigate to settings'),
        },
      ],
    },
    {
      id: 'actions',
      label: 'Actions',
      priority: 3,
      items: [
        {
          id: 'action-1',
          label: 'Create Document',
          icon: FileText,
          shortcut: ['⌘', 'N'],
          onSelect: () => console.log('Create document'),
        },
        {
          id: 'action-2',
          label: 'Send Invitation',
          icon: Mail,
          onSelect: () => console.log('Send invitation'),
        },
      ],
    },
  ]

  return (
    <div>
      <Button onClick={() => setOpen(true)}>
        Open Grouped Command Palette
      </Button>
      
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        placeholder="Search commands..."
        maxResults={8}
      />
    </div>
  )
}

const WithRecentItemsExample = () => {
  const [open, setOpen] = useState(false)
  const [recentItems, setRecentItems] = useState([
    {
      id: 'recent-dashboard',
      label: 'Dashboard',
      description: 'Main application dashboard',
      icon: Home,
      category: 'recent',
      onSelect: () => console.log('Navigate to dashboard'),
    },
  ])

  const items = [
    {
      id: 'users',
      label: 'Users',
      description: 'Manage user accounts',
      icon: Users,
      category: 'navigation',
      onSelect: () => console.log('Navigate to users'),
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Application settings',
      icon: Settings,
      category: 'navigation',
      onSelect: () => console.log('Navigate to settings'),
    },
    {
      id: 'docs',
      label: 'Documentation',
      description: 'View documentation',
      icon: FileText,
      category: 'navigation',
      onSelect: () => console.log('Navigate to docs'),
    },
  ]

  return (
    <div>
      <Button onClick={() => setOpen(true)}>
        Open with Recent Items
      </Button>
      
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={items}
        recentItems={recentItems}
        onRecentItemsChange={setRecentItems}
        placeholder="Search or select recent..."
      />
    </div>
  )
}

const examples = [
  {
    title: 'Basic Command Palette',
    code: `const [open, setOpen] = useState(false)

const items = [
  {
    id: 'home',
    label: 'Go to Dashboard',
    description: 'Navigate to the main dashboard',
    icon: Home,
    category: 'navigation',
    onSelect: () => console.log('Navigate to dashboard'),
  },
  {
    id: 'users',
    label: 'Manage Users',
    description: 'View and edit user accounts',
    icon: Users,
    category: 'navigation',
    shortcut: ['⌘', 'U'],
    onSelect: () => console.log('Navigate to users'),
  },
]

<Button onClick={() => setOpen(true)}>
  Open Command Palette
</Button>

<CommandPalette
  open={open}
  onOpenChange={setOpen}
  items={items}
  placeholder="Type a command or search..."
/>`,
    component: <BasicExample />,
  },
  {
    title: 'With Custom Groups',
    code: `const groups = [
  {
    id: 'recent',
    label: 'Recent',
    priority: 1,
    items: [...],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    priority: 2,
    items: [...],
  },
  {
    id: 'actions',
    label: 'Actions',
    priority: 3,
    items: [...],
  },
]

<CommandPalette
  open={open}
  onOpenChange={setOpen}
  groups={groups}
  placeholder="Search commands..."
  maxResults={8}
/>`,
    component: <WithGroupsExample />,
  },
  {
    title: 'With Recent Items Tracking',
    code: `const [recentItems, setRecentItems] = useState([...])

<CommandPalette
  open={open}
  onOpenChange={setOpen}
  items={items}
  recentItems={recentItems}
  onRecentItemsChange={setRecentItems}
  placeholder="Search or select recent..."
/>`,
    component: <WithRecentItemsExample />,
  },
]

export default function CommandPalettePage() {
  return (
    <ComponentLayout
      title="Command Palette"
      description="A searchable command interface that allows users to quickly navigate and perform actions using keyboard shortcuts."
      examples={examples}
    />
  )
}