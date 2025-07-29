'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BarChart3, 
  Mail, 
  CreditCard, 
  Shield, 
  Server, 
  Settings,
  ChevronRight
} from 'lucide-react'
import { cn } from '@nextsaas/ui'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Organizations',
    href: '/admin/organizations',
    icon: Building2,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    children: [
      { name: 'Overview', href: '/admin/analytics', icon: BarChart3 },
      { name: 'User Growth', href: '/admin/analytics/users', icon: Users },
      { name: 'Revenue', href: '/admin/analytics/revenue', icon: CreditCard },
    ]
  },
  {
    name: 'Email',
    href: '/admin/email',
    icon: Mail,
    children: [
      { name: 'Campaigns', href: '/admin/email/campaigns', icon: Mail },
      { name: 'Templates', href: '/admin/email/templates', icon: Mail },
      { name: 'Analytics', href: '/admin/email/analytics', icon: BarChart3 },
    ]
  },
  {
    name: 'Billing',
    href: '/admin/billing',
    icon: CreditCard,
    children: [
      { name: 'Subscriptions', href: '/admin/billing/subscriptions', icon: CreditCard },
      { name: 'Invoices', href: '/admin/billing/invoices', icon: CreditCard },
    ]
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
    children: [
      { name: 'Audit Logs', href: '/admin/security/audit-logs', icon: Shield },
      { name: 'Sessions', href: '/admin/security/sessions', icon: Shield },
    ]
  },
  {
    name: 'System',
    href: '/admin/system',
    icon: Server,
    children: [
      { name: 'Health', href: '/admin/system/health', icon: Server },
      { name: 'Performance', href: '/admin/system/performance', icon: BarChart3 },
    ]
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

interface NavItemComponentProps {
  item: NavItem
  isActive: boolean
  isExpanded?: boolean
  onToggle?: () => void
}

function NavItemComponent({ item, isActive, isExpanded, onToggle }: NavItemComponentProps) {
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <Link
        href={item.href}
        className={cn(
          'group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-100 text-blue-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
        onClick={hasChildren ? onToggle : undefined}
      >
        <item.icon
          className={cn(
            'mr-3 h-5 w-5 flex-shrink-0',
            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
          )}
        />
        {item.name}
        {hasChildren && (
          <ChevronRight
            className={cn(
              'ml-auto h-4 w-4 transition-transform',
              isExpanded ? 'rotate-90' : ''
            )}
          />
        )}
      </Link>
      
      {hasChildren && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children?.map((child) => (
            <NavItemComponent
              key={child.href}
              item={child}
              isActive={usePathname() === child.href}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  return (
    <div className="flex w-64 flex-col bg-white border-r border-gray-200" data-testid="admin-sidebar">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200" data-testid="logo-section">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto" data-testid="nav-container">
        <nav className="flex-1 space-y-1 px-2 py-4" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.children?.some(child => pathname === child.href) ?? false)
            const isExpanded = expandedItems.includes(item.href)
            
            return (
              <NavItemComponent
                key={item.name}
                item={item}
                isActive={isActive}
                isExpanded={isExpanded || false}
                onToggle={() => toggleExpanded(item.href)}
              />
            )
          })}
        </nav>
        
        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4" data-testid="sidebar-footer">
          <div className="text-xs text-gray-500 text-center">
            NextSaaS Admin v1.0
          </div>
        </div>
      </div>
    </div>
  )
}