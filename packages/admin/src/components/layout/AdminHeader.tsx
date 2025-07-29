'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@nextsaas/auth'
import { Button } from '@nextsaas/ui'

// Simple breadcrumb mapping
const breadcrumbMap: Record<string, string[]> = {
  '/admin': ['Dashboard'],
  '/admin/users': ['Users'],
  '/admin/users/[id]': ['Users', 'User Details'],
  '/admin/organizations': ['Organizations'],
  '/admin/analytics': ['Analytics'],
  '/admin/email': ['Email'],
  '/admin/billing': ['Billing'],
  '/admin/security': ['Security'],
  '/admin/system': ['System'],
  '/admin/settings': ['Settings'],
}

function AdminBreadcrumb() {
  const pathname = usePathname()
  const breadcrumbs = breadcrumbMap[pathname] || ['Dashboard']

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
            <span 
              className={index === breadcrumbs.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-500'
              }
            >
              {crumb}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function AdminHeader() {
  const { user, signOut } = useAuth() as any
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6" data-testid="header-container">
        {/* Left side - Breadcrumb */}
        <div className="flex items-center">
          <AdminBreadcrumb />
        </div>

        {/* Right side - Search and User menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              aria-label="Search"
              className="w-64 rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name || user?.email}
              </span>
            </Button>

            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <div className="py-1">
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                    aria-label="Account Settings"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Account Settings
                  </button>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      signOut()
                      setShowUserMenu(false)
                    }}
                    role="menuitem"
                    aria-label="Sign Out"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}