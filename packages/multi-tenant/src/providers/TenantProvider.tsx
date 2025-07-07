'use client'

import React from 'react'
import { OrganizationProvider } from './OrganizationProvider'
import { WorkspaceProvider } from './WorkspaceProvider'

interface TenantProviderProps {
  children: React.ReactNode
  organizationMode?: 'none' | 'single' | 'multi'
}

/**
 * TenantProvider combines organization and workspace contexts
 * for complete multi-tenant functionality
 */
export function TenantProvider({ 
  children, 
  organizationMode = 'multi' 
}: TenantProviderProps) {
  return (
    <OrganizationProvider organizationMode={organizationMode}>
      <WorkspaceProvider>
        {children}
      </WorkspaceProvider>
    </OrganizationProvider>
  )
}