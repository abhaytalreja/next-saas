'use client'

import React from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { useAuth } from '@nextsaas/auth'
import { redirect } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        data-testid="loading-container"
      >
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          data-testid="loading-spinner"
          role="status"
          aria-label="Loading admin dashboard"
        ></div>
      </div>
    )
  }

  // Redirect if not authenticated (this should be caught by middleware, but adding as fallback)
  if (!user) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-layout-container">
      <div className="flex h-screen" data-testid="admin-layout-flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden" data-testid="admin-main-area">
          {/* Header */}
          <AdminHeader />
          
          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-6 py-8" data-testid="admin-content-container">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}