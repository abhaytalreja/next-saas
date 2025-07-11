'use client'

import { useAuth } from '@nextsaas/auth'
import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/navigation/app-sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Don't show sidebar during loading or for unauthenticated users
  if (loading || !user) {
    return <>{children}</>
  }

  // Don't show AppSidebar for dashboard or settings routes as they have their own layouts
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
    return <>{children}</>
  }

  // Show sidebar for other authenticated routes
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  )
}