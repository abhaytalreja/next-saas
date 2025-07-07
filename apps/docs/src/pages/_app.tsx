import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import TopNav from '../components/TopNav'
import { ChevronDown, ChevronRight } from 'lucide-react'

type NavItem = {
  name: string
  href: string
  current?: boolean
  children?: NavItem[]
}

type NavSection = {
  name: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    name: '🚀 Quick Start',
    items: [
      { name: 'Overview', href: '/', current: false },
      { name: 'Setup Methods', href: '/setup-methods', current: false },
      { name: '5-Minute Setup', href: '/quickstart', current: false },
      { name: 'Project Structure', href: '/project-structure', current: false },
    ]
  },
  {
    name: '✨ Features',
    items: [
      { name: 'Business Logic', href: '/features/business-logic', current: false },
      { name: 'Pricing Sync', href: '/features/pricing-sync', current: false },
      { name: 'Authentication', href: '/features/authentication', current: false },
      { name: 'Auth Setup Guide', href: '/features/auth-setup', current: false },
      { name: 'Database', href: '/features/database', current: false },
      { name: 'UI Components', href: '/features/ui-components', current: false },
    ]
  },
  {
    name: '🎨 UI Components',
    items: [
      { name: 'Overview', href: '/features/ui-components' },
      { name: 'All Components', href: '/components' },
      { name: 'Auth Components', href: '/components/auth-components' },
      { 
        name: 'Typography', 
        href: '#',
        children: [
          { name: 'Heading', href: '/components/heading' },
          { name: 'Text', href: '/components/text' },
        ]
      },
      { 
        name: 'Actions', 
        href: '#',
        children: [
          { name: 'Button', href: '/components/button' },
          { name: 'Icon Button', href: '/components/icon-button' },
          { name: 'Link', href: '/components/link' },
        ]
      },
      { 
        name: 'Forms', 
        href: '#',
        children: [
          { name: 'Input', href: '/components/input' },
          { name: 'Select', href: '/components/select' },
          { name: 'Checkbox', href: '/components/checkbox' },
          { name: 'Radio', href: '/components/radio' },
          { name: 'Textarea', href: '/components/textarea' },
          { name: 'Switch', href: '/components/switch' },
          { name: 'Form', href: '/components/form' },
          { name: 'Form Field', href: '/components/form-field' },
          { name: 'Search Box', href: '/components/search-box' },
          { name: 'Date Picker', href: '/components/date-picker' },
          { name: 'File Uploader', href: '/components/file-uploader' },
        ]
      },
      { 
        name: 'Layout', 
        href: '#',
        children: [
          { name: 'Container', href: '/components/container' },
          { name: 'Grid', href: '/components/grid' },
          { name: 'Stack', href: '/components/stack' },
          { name: 'Section', href: '/components/section' },
          { name: 'Card', href: '/components/card' },
        ]
      },
      { 
        name: 'Navigation', 
        href: '#',
        children: [
          { name: 'Tabs', href: '/components/tabs' },
          { name: 'Breadcrumb', href: '/components/breadcrumb' },
          { name: 'Pagination', href: '/components/pagination' },
          { name: 'Navbar', href: '/components/navbar' },
          { name: 'Sidebar', href: '/components/sidebar' },
          { name: 'Menu', href: '/components/menu' },
          { name: 'Context Menu', href: '/components/context-menu' },
          { name: 'Dropdown Menu', href: '/components/dropdown-menu' },
          { name: 'Navigation', href: '/components/navigation' },
          { name: 'Header', href: '/components/header' },
          { name: 'Command Palette', href: '/components/command-palette' },
        ]
      },
      { 
        name: 'Data Display', 
        href: '#',
        children: [
          { name: 'Table', href: '/components/table' },
          { name: 'List', href: '/components/list' },
          { name: 'Stat', href: '/components/stat' },
          { name: 'Badge', href: '/components/badge' },
          { name: 'Tag', href: '/components/tag' },
          { name: 'Avatar', href: '/components/avatar' },
          { name: 'Skeleton', href: '/components/skeleton' },
          { name: 'Divider', href: '/components/divider' },
          { name: 'Data Table', href: '/components/data-table' },
          { name: 'Data Grid', href: '/components/data-grid' },
          { name: 'Icon', href: '/components/icon' },
        ]
      },
      { 
        name: 'Feedback', 
        href: '#',
        children: [
          { name: 'Alert', href: '/components/alert' },
          { name: 'Progress', href: '/components/progress' },
          { name: 'Spinner', href: '/components/spinner' },
          { name: 'Tooltip', href: '/components/tooltip' },
          { name: 'Toast', href: '/components/toast' },
          { name: 'Modal', href: '/components/modal' },
          { name: 'Drawer', href: '/components/drawer' },
          { name: 'Notification Center', href: '/components/notification-center' },
        ]
      },
      { 
        name: 'Organisms', 
        href: '#',
        children: [
          { name: 'Dashboard', href: '/components/dashboard' },
        ]
      },
      { 
        name: 'Templates', 
        href: '#',
        children: [
          { name: 'Empty State', href: '/components/empty-state' },
          { name: 'Dashboard Layout', href: '/components/dashboard-layout' },
          { name: 'Auth Layout', href: '/components/auth-layout' },
        ]
      },
    ]
  },
  {
    name: '🛠️ Development',
    items: [
      { name: 'Local Development', href: '/development/local', current: false },
    ]
  },
  {
    name: '🏗️ Architecture',
    items: [
      { name: 'Organization Modes', href: '/architecture/organization-modes', current: false },
      { name: 'Database Schema', href: '/architecture/database-schema', current: false },
    ]
  },
  {
    name: '🔧 Troubleshooting',
    items: [
      { name: 'Overview', href: '/troubleshooting', current: false },
      { name: 'Environment Variables', href: '/troubleshooting/environment-variables', current: false },
      { name: 'Database Errors', href: '/troubleshooting/database-errors', current: false },
    ]
  }
]

export default function App({ Component, pageProps }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const router = useRouter()

  // Auto-expand sections that contain the current page
  useEffect(() => {
    const path = router.pathname
    const newExpanded: Record<string, boolean> = {}
    
    navigation.forEach(section => {
      section.items.forEach(item => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => child.href === path)
          if (hasActiveChild) {
            newExpanded[`${section.name}-${item.name}`] = true
          }
        }
      })
    })
    
    setExpandedSections(prev => ({ ...prev, ...newExpanded }))
  }, [router.pathname])

  const toggleSection = (sectionName: string, itemName: string) => {
    const key = `${sectionName}-${itemName}`
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isActivePath = (href: string) => {
    return router.pathname === href
  }

  const hasActiveChild = (item: NavItem) => {
    if (!item.children) return false
    return item.children.some(child => isActivePath(child.href))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="flex pt-16"> {/* Add padding-top for fixed nav */}
        {/* Left Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200 shadow-sm">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                {/* Scroll indicator */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 transition-opacity duration-300" />
                
                <nav className="mt-2 flex-1 px-2 space-y-6">
                  {navigation.map((section) => (
                    <div key={section.name}>
                      <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        {section.name}
                      </h3>
                      <div className="mt-2 space-y-0.5">
                        {section.items.map((item) => {
                          const isExpanded = expandedSections[`${section.name}-${item.name}`]
                          const isActive = isActivePath(item.href)
                          const hasActive = hasActiveChild(item)
                          
                          return (
                            <div key={item.name}>
                              {item.children ? (
                                <>
                                  <button
                                    onClick={() => toggleSection(section.name, item.name)}
                                    className={`w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                      hasActive ? 'text-gray-900 bg-gray-100' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                  >
                                    <span className="flex items-center">
                                      {item.name}
                                    </span>
                                    <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                      <ChevronDown className="h-4 w-4" />
                                    </span>
                                  </button>
                                  {isExpanded && (
                                    <div className="ml-3 space-y-0.5 mt-0.5">
                                      {item.children.map((child) => {
                                        const isChildActive = isActivePath(child.href)
                                        return (
                                          <a
                                            key={child.name}
                                            href={child.href}
                                            className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-all duration-200 ${
                                              isChildActive
                                                ? 'bg-gray-900 text-white font-medium'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                          >
                                            {child.name}
                                          </a>
                                        )
                                      })}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <a
                                  href={item.href}
                                  className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-all duration-200 ${
                                    isActive
                                      ? 'bg-gray-900 text-white font-medium'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                                >
                                  {item.name}
                                </a>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <a href="http://localhost:3000" className="text-blue-600 hover:text-blue-800 text-sm">
                  ← Back to Web App
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        <div className="md:hidden">
          <div className="fixed inset-0 flex z-40" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                {/* Remove title from mobile sidebar too */}
                <nav className="mt-5 px-2 space-y-8">
                  {navigation.map((section) => (
                    <div key={section.name}>
                      <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        {section.name}
                      </h3>
                      <div className="mt-2 space-y-0.5">
                        {section.items.map((item) => {
                          const isExpanded = expandedSections[`${section.name}-${item.name}`]
                          const isActive = isActivePath(item.href)
                          const hasActive = hasActiveChild(item)
                          
                          return (
                            <div key={item.name}>
                              {item.children ? (
                                <>
                                  <button
                                    onClick={() => toggleSection(section.name, item.name)}
                                    className={`w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                      hasActive ? 'text-gray-900 bg-gray-100' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                  >
                                    <span className="flex items-center">
                                      {item.name}
                                    </span>
                                    <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                      <ChevronDown className="h-4 w-4" />
                                    </span>
                                  </button>
                                  {isExpanded && (
                                    <div className="ml-3 space-y-0.5 mt-0.5">
                                      {item.children.map((child) => {
                                        const isChildActive = isActivePath(child.href)
                                        return (
                                          <a
                                            key={child.name}
                                            href={child.href}
                                            className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-all duration-200 ${
                                              isChildActive
                                                ? 'bg-gray-900 text-white font-medium'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                          >
                                            {child.name}
                                          </a>
                                        )
                                      })}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <a
                                  href={item.href}
                                  className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-all duration-200 ${
                                    isActive
                                      ? 'bg-gray-900 text-white font-medium'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                                >
                                  {item.name}
                                </a>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="md:hidden">
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
              <button
                type="button"
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
            </div>
          </div>
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Component {...pageProps} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}