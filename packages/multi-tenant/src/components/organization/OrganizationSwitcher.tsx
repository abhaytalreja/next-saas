'use client'

import React, { useState } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import { ChevronDown, Plus, Check, Building2, Settings } from 'lucide-react'
import type { Organization } from '../../types'

interface OrganizationSwitcherProps {
  className?: string
  showCreateButton?: boolean
  onCreateClick?: () => void
  onSettingsClick?: () => void
}

export function OrganizationSwitcher({
  className = '',
  showCreateButton = true,
  onCreateClick,
  onSettingsClick,
}: OrganizationSwitcherProps) {
  const {
    currentOrganization,
    organizations,
    switchOrganization,
    isLoading,
    canManageOrganization,
  } = useOrganization()

  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const handleSwitch = async (orgId: string) => {
    if (orgId === currentOrganization?.id) {
      setIsOpen(false)
      return
    }

    setIsSwitching(true)
    try {
      await switchOrganization(orgId)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to switch organization:', error)
    } finally {
      setIsSwitching(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-8 w-8 animate-pulse bg-gray-200 rounded" />
        <div className="h-4 w-24 animate-pulse bg-gray-200 rounded" />
      </div>
    )
  }

  if (!currentOrganization) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        disabled={isSwitching}
      >
        <div className="flex items-center space-x-3">
          {currentOrganization.logo_url ? (
            <img
              src={currentOrganization.logo_url}
              alt={currentOrganization.name}
              className="h-6 w-6 rounded"
            />
          ) : (
            <div className="h-6 w-6 bg-indigo-600 rounded flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          )}
          <div className="text-left">
            <div className="font-medium">{currentOrganization.name}</div>
            {organizations.length > 1 && (
              <div className="text-xs text-gray-500">
                {organizations.length} organizations
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 origin-top-left bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Organizations
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSwitch(org.id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    disabled={isSwitching}
                  >
                    <div className="flex items-center space-x-3">
                      {org.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="h-6 w-6 rounded"
                        />
                      ) : (
                        <div className="h-6 w-6 bg-gray-400 rounded flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="text-left">
                        <div className="font-medium">{org.name}</div>
                        <div className="text-xs text-gray-500">
                          {org.subscription_status === 'trial' ? 'Trial' : 'Active'}
                        </div>
                      </div>
                    </div>
                    {org.id === currentOrganization.id && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200">
                {showCreateButton && onCreateClick && (
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      onCreateClick()
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </button>
                )}

                {canManageOrganization() && onSettingsClick && (
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      onSettingsClick()
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Organization Settings
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}