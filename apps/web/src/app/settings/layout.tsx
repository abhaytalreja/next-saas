'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProtectedLayout } from '@/packages/auth'
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  BuildingOfficeIcon,
  CreditCardIcon,
  BellIcon,
  Cog6ToothIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Profile', href: '/settings/profile', icon: UserCircleIcon },
  { name: 'Security', href: '/settings/security', icon: ShieldCheckIcon },
  { name: 'Notifications', href: '/settings/notifications', icon: BellIcon },
  { name: 'Organization', href: '/settings/organization', icon: BuildingOfficeIcon },
  { name: 'Team Members', href: '/settings/organization/members', icon: UserGroupIcon },
  { name: 'Billing', href: '/settings/organization/billing', icon: CreditCardIcon },
  { name: 'Preferences', href: '/settings/preferences', icon: Cog6ToothIcon },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3">
              <nav className="space-y-1" aria-label="Settings navigation">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/settings/organization' && pathname.startsWith(item.href))
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md
                        ${
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }
                        transition-colors duration-150 ease-in-out
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon
                        className={`
                          -ml-1 mr-3 h-5 w-5 flex-shrink-0
                          ${
                            isActive
                              ? 'text-primary-600'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }
                        `}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Navigation */}
              <div className="mt-8 lg:hidden">
                <label htmlFor="settings-nav" className="sr-only">
                  Settings navigation
                </label>
                <select
                  id="settings-nav"
                  className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  value={pathname}
                  onChange={(e) => window.location.href = e.target.value}
                >
                  {navigation.map((item) => (
                    <option key={item.href} value={item.href}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </aside>

            {/* Main Content */}
            <main className="mt-8 lg:mt-0 lg:col-span-9">
              <div className="bg-white shadow rounded-lg">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}