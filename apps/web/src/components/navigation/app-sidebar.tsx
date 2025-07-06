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
    title: 'Components',
    href: '/components',
    icon: Box,
    children: [
      {
        title: 'Actions',
        icon: Layers,
        children: [
          { title: 'Buttons', href: '/components?tab=buttons' },
          { title: 'Links', href: '/components?tab=links' },
          { title: 'Icon Buttons', href: '/components?tab=icon-buttons' },
          { title: 'Menus', href: '/components?tab=menus' },
        ],
      },
      {
        title: 'Form Elements',
        icon: FileText,
        children: [
          { title: 'Inputs', href: '/components?tab=inputs' },
          { title: 'Select', href: '/components?tab=select' },
          { title: 'Checkbox & Radio', href: '/components?tab=checkbox-radio' },
          { title: 'Textarea', href: '/components?tab=textarea' },
          { title: 'Switch', href: '/components?tab=switch' },
        ],
      },
      {
        title: 'Layout',
        icon: Layout,
        children: [
          { title: 'Container', href: '/components?tab=container' },
          { title: 'Grid', href: '/components?tab=grid' },
          { title: 'Stack', href: '/components?tab=stack' },
          { title: 'Section', href: '/components?tab=section' },
        ],
      },
      {
        title: 'Navigation',
        icon: Navigation,
        children: [
          { title: 'Navbar', href: '/components?tab=navbar' },
          { title: 'Sidebar', href: '/components?tab=sidebar' },
          { title: 'Tabs', href: '/components?tab=tabs' },
          { title: 'Breadcrumb', href: '/components?tab=breadcrumb' },
          { title: 'Pagination', href: '/components?tab=pagination' },
        ],
      },
      {
        title: 'Data Display',
        icon: Database,
        children: [
          { title: 'Cards', href: '/components?tab=cards' },
          { title: 'Table', href: '/components?tab=table' },
          { title: 'List', href: '/components?tab=list' },
          { title: 'Stats', href: '/components?tab=stats' },
          { title: 'Badges', href: '/components?tab=badges' },
          { title: 'Avatars', href: '/components?tab=avatars' },
        ],
      },
      {
        title: 'Feedback',
        icon: MessageSquare,
        children: [
          { title: 'Alerts', href: '/components?tab=alerts' },
          { title: 'Progress', href: '/components?tab=progress' },
          { title: 'Spinner', href: '/components?tab=spinner' },
          { title: 'Tooltip', href: '/components?tab=tooltip' },
          { title: 'Toast', href: '/components?tab=toast' },
          { title: 'Modal', href: '/components?tab=modal' },
          { title: 'Drawer', href: '/components?tab=drawer' },
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
  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + '?')
    : false

  React.useEffect(() => {
    if (item.children && pathname.startsWith('/components')) {
      setIsOpen(true)
    }
  }, [pathname, item.children])

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
              'text-gray-700 dark:text-gray-300',
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
