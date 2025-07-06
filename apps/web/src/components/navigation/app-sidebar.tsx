'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Box,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Layers,
  Layout,
  Navigation,
  Database,
  MessageSquare,
  BarChart,
} from 'lucide-react'
import { cn } from '@nextsaas/ui'

interface NavItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  badge?: string
}

const navigation: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'UI Components',
    icon: Box,
    href: '/docs/components',
    children: [
      {
        title: 'Actions',
        icon: Layers,
        children: [
          { title: 'Buttons', href: '/docs/components/actions/buttons' },
          { title: 'Links', href: '/docs/components/actions/links' },
          { title: 'Icon Buttons', href: '/docs/components/actions/icon-buttons' },
          { title: 'Menus', href: '/docs/components/actions/menus' },
        ],
      },
      {
        title: 'Forms',
        icon: FileText,
        children: [
          { title: 'Inputs', href: '/docs/components/forms/inputs' },
          { title: 'Select', href: '/docs/components/forms/select' },
          { title: 'Checkbox & Radio', href: '/docs/components/forms/checkbox-radio' },
          { title: 'Textarea', href: '/docs/components/forms/textarea' },
          { title: 'Switch', href: '/docs/components/forms/switch' },
        ],
      },
      {
        title: 'Layout',
        icon: Layout,
        children: [
          { title: 'Container', href: '/docs/components/layout/container' },
          { title: 'Grid', href: '/docs/components/layout/grid' },
          { title: 'Stack', href: '/docs/components/layout/stack' },
          { title: 'Section', href: '/docs/components/layout/section' },
        ],
      },
      {
        title: 'Navigation',
        icon: Navigation,
        children: [
          { title: 'Navbar', href: '/docs/components/navigation/navbar' },
          { title: 'Sidebar', href: '/docs/components/navigation/sidebar' },
          { title: 'Tabs', href: '/docs/components/navigation/tabs' },
          { title: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' },
          { title: 'Pagination', href: '/docs/components/navigation/pagination' },
        ],
      },
      {
        title: 'Data Display',
        icon: Database,
        children: [
          { title: 'Cards', href: '/docs/components/data-display/cards' },
          { title: 'Table', href: '/docs/components/data-display/table' },
          { title: 'List', href: '/docs/components/data-display/list' },
          { title: 'Stats', href: '/docs/components/data-display/stats' },
          { title: 'Badges', href: '/docs/components/data-display/badges' },
          { title: 'Avatars', href: '/docs/components/data-display/avatars' },
        ],
      },
      {
        title: 'Feedback',
        icon: MessageSquare,
        children: [
          { title: 'Alerts', href: '/docs/components/feedback/alerts' },
          { title: 'Progress', href: '/docs/components/feedback/progress' },
          { title: 'Spinner', href: '/docs/components/feedback/spinner' },
          { title: 'Tooltip', href: '/docs/components/feedback/tooltip' },
          { title: 'Toast', href: '/docs/components/feedback/toast' },
          { title: 'Modal', href: '/docs/components/feedback/modal' },
          { title: 'Drawer', href: '/docs/components/feedback/drawer' },
        ],
      },
    ],
  },
  {
    title: 'Documentation',
    href: 'http://localhost:3001',
    icon: FileText,
    badge: 'External',
  },
]

interface NavItemComponentProps {
  item: NavItem
  depth?: number
}

function NavItemComponent({ item, depth = 0 }: NavItemComponentProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href ? pathname === item.href : false
  
  // Check if any child is active
  const hasActiveChild = hasChildren && item.children!.some(child => 
    child.href ? pathname === child.href : false
  )

  React.useEffect(() => {
    // Auto-expand UI Components section and relevant subsections when on component pages
    if (pathname.startsWith('/components') || pathname.startsWith('/docs/components')) {
      if (item.title === 'UI Components') {
        setIsOpen(true)
      } else if (hasChildren && hasActiveChild) {
        setIsOpen(true)
      }
    }
  }, [pathname, item.title, hasChildren, hasActiveChild])

  const content = (
    <>
      {hasChildren && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          style={{ left: `${depth * 0.75}rem` }}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      )}

      <div className="flex items-center gap-3">
        {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
        <span className="flex-1">{item.title}</span>
        {item.badge && (
          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
            {item.badge}
          </span>
        )}
      </div>
    </>
  )

  return (
    <>
      <li>
        {item.href ? (
          <Link
            href={item.href}
            className={cn(
              'relative flex items-center py-2 px-3 text-sm font-medium rounded-md transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              isActive
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300',
              hasChildren && 'pl-8'
            )}
            style={{
              paddingLeft: hasChildren
                ? `${(depth + 2) * 0.75}rem`
                : `${(depth + 1) * 0.75}rem`,
            }}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={
              item.href.startsWith('http') ? 'noopener noreferrer' : undefined
            }
          >
            {content}
          </Link>
        ) : (
          <div
            className={cn(
              'relative flex items-center py-2 px-3 text-sm font-medium rounded-md',
              hasActiveChild
                ? 'text-primary-700 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300',
              hasChildren && 'pl-8'
            )}
            style={{
              paddingLeft: hasChildren
                ? `${(depth + 2) * 0.75}rem`
                : `${(depth + 1) * 0.75}rem`,
            }}
          >
            {content}
          </div>
        )}
      </li>

      {hasChildren && isOpen && (
        <ul className="mt-1 space-y-1">
          {item.children!.map((child, index) => (
            <NavItemComponent key={index} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </>
  )
}

export function AppSidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          NextSaaS
        </h2>
      </div>

      <nav className="px-4 pb-6">
        <ul className="space-y-1">
          {navigation.map((item, index) => (
            <NavItemComponent key={index} item={item} />
          ))}
        </ul>
      </nav>
    </aside>
  )
}
