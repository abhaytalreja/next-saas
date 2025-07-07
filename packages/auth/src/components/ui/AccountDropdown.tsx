'use client'

import React, { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useOrganization } from '../../hooks'
import { UserAvatar } from './UserAvatar'
import { 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

interface AccountDropdownProps {
  className?: string
  showOrganization?: boolean
  avatarUrl?: string | null
  customTrigger?: React.ReactNode
}

export function AccountDropdown({ 
  className = '', 
  showOrganization = true,
  avatarUrl,
  customTrigger 
}: AccountDropdownProps) {
  const { user, signOut } = useAuth()
  const { currentOrganization } = useOrganization()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const menuItems = [
    {
      label: 'Account',
      items: [
        {
          label: 'Profile',
          href: '/settings/profile',
          icon: UserCircleIcon,
          description: 'Manage your personal information',
        },
        {
          label: 'Security',
          href: '/settings/security',
          icon: ShieldCheckIcon,
          description: 'Password and authentication',
        },
        {
          label: 'Notifications',
          href: '/settings/notifications',
          icon: BellIcon,
          description: 'Email and push notifications',
        },
      ],
    },
    ...(showOrganization && currentOrganization ? [{
      label: 'Organization',
      items: [
        {
          label: 'Settings',
          href: '/settings/organization',
          icon: BuildingOfficeIcon,
          description: 'Organization preferences',
        },
        {
          label: 'Members',
          href: '/settings/organization/members',
          icon: UserGroupIcon,
          description: 'Manage team members',
        },
        {
          label: 'Billing',
          href: '/settings/organization/billing',
          icon: CreditCardIcon,
          description: 'Plans and invoices',
        },
      ],
    }] : []),
    {
      label: 'Support',
      items: [
        {
          label: 'Help Center',
          href: '/help',
          icon: QuestionMarkCircleIcon,
          description: 'Guides and documentation',
        },
        {
          label: 'Settings',
          href: '/settings',
          icon: Cog6ToothIcon,
          description: 'App preferences',
        },
      ],
    },
  ]

  if (!user) return null

  const userName = user.user_metadata?.full_name || 
    (user.user_metadata?.first_name && user.user_metadata?.last_name 
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user.email)

  return (
    <Menu as="div" className={`relative ${className}`}>
      <Menu.Button 
        className="flex items-center gap-2 rounded-lg p-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
        aria-label="Account menu"
      >
        {customTrigger || (
          <>
            <div className="flex items-center gap-3">
              <UserAvatar
                src={avatarUrl || user.user_metadata?.avatar_url}
                firstName={user.user_metadata?.first_name}
                lastName={user.user_metadata?.last_name}
                email={user.email}
                size="sm"
              />
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {userName}
                </div>
                {showOrganization && currentOrganization && (
                  <div className="text-xs text-gray-500">
                    {currentOrganization.name}
                  </div>
                )}
              </div>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={avatarUrl || user.user_metadata?.avatar_url}
                firstName={user.user_metadata?.first_name}
                lastName={user.user_metadata?.last_name}
                email={user.email}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu sections */}
          <div className="py-1">
            {menuItems.map((section, sectionIdx) => (
              <div key={section.label}>
                {sectionIdx > 0 && <div className="my-1 border-t border-gray-100" />}
                <div className="px-3 py-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.label}
                  </p>
                </div>
                {section.items.map((item) => (
                  <Menu.Item key={item.href}>
                    {({ active }) => (
                      <Link
                        href={item.href}
                        className={`
                          ${active ? 'bg-gray-50' : ''}
                          group flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors
                        `}
                      >
                        <item.icon 
                          className={`
                            ${active ? 'text-primary-600' : 'text-gray-400'}
                            h-5 w-5 group-hover:text-primary-600 transition-colors
                          `} 
                          aria-hidden="true" 
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            ))}
          </div>

          {/* Sign out button */}
          <div className="border-t border-gray-100 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`
                    ${active ? 'bg-gray-50' : ''}
                    group flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors
                  `}
                >
                  <ArrowRightOnRectangleIcon 
                    className={`
                      ${active ? 'text-red-600' : 'text-gray-400'}
                      h-5 w-5 group-hover:text-red-600 transition-colors
                    `} 
                    aria-hidden="true" 
                  />
                  <span className="font-medium group-hover:text-red-600 transition-colors">
                    Sign out
                  </span>
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}