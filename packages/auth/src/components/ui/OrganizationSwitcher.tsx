'use client'

import React, { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '../../hooks'
import { 
  CheckIcon, 
  ChevronUpDownIcon,
  PlusIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

interface OrganizationSwitcherProps {
  className?: string
  showCreateOption?: boolean
  onCreateClick?: () => void
  variant?: 'dropdown' | 'select'
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'py-1.5 px-3 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-3 px-5 text-lg',
}

export function OrganizationSwitcher({
  className = '',
  showCreateOption = true,
  onCreateClick,
  variant = 'dropdown',
  size = 'md',
}: OrganizationSwitcherProps) {
  const router = useRouter()
  const { 
    currentOrganization, 
    organizations, 
    switchOrganization, 
    loading 
  } = useOrganization()
  
  const [switching, setSwitching] = useState(false)

  const handleOrganizationChange = async (orgId: string) => {
    if (orgId === 'create') {
      if (onCreateClick) {
        onCreateClick()
      } else {
        router.push('/settings/organization/new')
      }
      return
    }

    if (orgId === currentOrganization?.id) return

    try {
      setSwitching(true)
      await switchOrganization(orgId)
      // Refresh the page to update all organization-specific data
      router.refresh()
    } catch (error) {
      console.error('Failed to switch organization:', error)
    } finally {
      setSwitching(false)
    }
  }

  if (loading || !currentOrganization) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 animate-pulse rounded-lg ${className}`}>
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>
    )
  }

  const selectedOrg = organizations.find(org => org.id === currentOrganization.id) || currentOrganization

  return (
    <Listbox 
      value={currentOrganization.id} 
      onChange={handleOrganizationChange}
      disabled={switching}
    >
      <div className={`relative ${className}`}>
        <Listbox.Button 
          className={`
            relative w-full cursor-pointer rounded-lg bg-white 
            ${sizeClasses[size]}
            pr-10 text-left shadow-sm ring-1 ring-gray-300
            hover:ring-gray-400 focus:outline-none focus:ring-2 
            focus:ring-primary-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
          `}
          aria-label="Switch organization"
        >
          <div className="flex items-center gap-3">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <div className="flex-1 truncate">
              <span className="block font-medium text-gray-900 truncate">
                {selectedOrg.name}
              </span>
              {selectedOrg.memberships_count && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <UserGroupIcon className="h-3 w-3" />
                  {selectedOrg.memberships_count} member{selectedOrg.memberships_count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {/* Current user's organizations */}
            <div className="py-1">
              <div className="px-3 py-1.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Your Organizations
                </p>
              </div>
              
              {organizations.map((org) => (
                <Listbox.Option
                  key={org.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 px-3 ${
                      active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                    }`
                  }
                  value={org.id}
                  disabled={switching}
                >
                  {({ selected, active }) => (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BuildingOfficeIcon 
                          className={`h-5 w-5 ${
                            selected ? 'text-primary-600' : 'text-gray-400'
                          }`} 
                          aria-hidden="true" 
                        />
                        <div>
                          <span
                            className={`block truncate ${
                              selected ? 'font-semibold' : 'font-normal'
                            }`}
                          >
                            {org.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {org.role === 'owner' ? 'Owner' : 
                             org.role === 'admin' ? 'Admin' : 'Member'}
                            {org.memberships_count && ` • ${org.memberships_count} members`}
                          </span>
                        </div>
                      </div>
                      
                      {selected && (
                        <CheckIcon 
                          className="h-5 w-5 text-primary-600" 
                          aria-hidden="true" 
                        />
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </div>

            {/* Create new organization option */}
            {showCreateOption && (
              <>
                <div className="border-t border-gray-100" />
                <div className="py-1">
                  <Listbox.Option
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 px-3 ${
                        active ? 'bg-gray-50' : ''
                      }`
                    }
                    value="create"
                  >
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200">
                        <PlusIcon className="h-3 w-3" aria-hidden="true" />
                      </div>
                      <span className="font-medium">Create New Organization</span>
                    </div>
                  </Listbox.Option>
                </div>
              </>
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

// Compact variant for use in headers
export function OrganizationSwitcherCompact({
  className = '',
}: {
  className?: string
}) {
  const { currentOrganization } = useOrganization()

  if (!currentOrganization) return null

  return (
    <OrganizationSwitcher
      className={className}
      variant="dropdown"
      size="sm"
      showCreateOption={false}
    />
  )
}