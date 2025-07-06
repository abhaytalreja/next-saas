'use client'

import { useAuth } from '@nextsaas/auth'
import { AppSidebar } from '@/components/navigation/app-sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, loading } = useAuth()

  // Don't show sidebar during loading or for unauthenticated users
  if (loading || !user) {
    return <>{children}</>
  }

  // Show sidebar for authenticated users
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  )
}