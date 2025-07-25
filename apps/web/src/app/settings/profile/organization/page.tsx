'use client'

import React from 'react'
import { OrganizationAwareProfileManager } from '@nextsaas/auth'
import { OrganizationProvider } from '@nextsaas/auth'

export default function OrganizationProfilePage() {
  return (
    <OrganizationProvider>
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        {/* Page Header */}
        <header className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Organization Profile Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your profile settings within organizational contexts. Switch between organizations to manage context-specific settings and data.
          </p>
        </header>

        {/* Organization-Aware Profile Manager */}
        <main>
          <OrganizationAwareProfileManager
            showOrganizationSwitcher={true}
            defaultTab="profile"
          />
        </main>
      </div>
    </OrganizationProvider>
  )
}