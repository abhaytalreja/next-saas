'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ProtectedLayout,
  AccountDropdown,
  OrganizationSwitcher,
} from '@nextsaas/auth'
import {
  HomeIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderIcon },
  { name: 'Team', href: '/dashboard/team', icon: UsersIcon },
  {
    name: 'Documents',
    href: '/dashboard/documents',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:hidden`}>
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0" aria-hidden="true">
              <div
                className="absolute inset-0 bg-gray-600 opacity-75"
                onClick={() => setSidebarOpen(false)}
              />
            </div>

            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <Link
                    href="/"
                    className="text-2xl font-bold text-primary-600"
                  >
                    NextSaaS
                  </Link>
                </div>

                <nav className="mt-8 px-2 space-y-1">
                  {navigation.map(item => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + '/')

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          group flex items-center px-2 py-2 text-base font-medium rounded-md
                          ${
                            isActive
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon
                          className={`
                            mr-4 h-6 w-6 flex-shrink-0
                            ${isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}
                          `}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <OrganizationSwitcher className="w-full" />
              </div>
            </div>

            <div className="flex-shrink-0 w-14" aria-hidden="true" />
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Link href="/" className="text-2xl font-bold text-primary-600">
                  NextSaaS
                </Link>
              </div>

              <nav className="mt-8 flex-1 px-2 space-y-1" aria-label="Sidebar">
                {navigation.map(item => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' &&
                      pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md
                        ${
                          isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon
                        className={`
                          mr-3 h-5 w-5 flex-shrink-0
                          ${isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}
                        `}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <OrganizationSwitcher className="w-full" />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Top header */}
          <header className="sticky top-0 z-10 bg-white shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-4 -ml-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <span className="sr-only">Open sidebar</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <h1 className="text-lg font-semibold text-gray-900 lg:hidden">
                    {navigation.find(
                      item =>
                        pathname === item.href ||
                        pathname.startsWith(item.href + '/')
                    )?.name || 'Dashboard'}
                  </h1>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Add notification bell, search, etc. here */}
                  <AccountDropdown />
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ProtectedLayout>
  )
}
