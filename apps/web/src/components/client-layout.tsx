'use client'

import { AuthProvider, OrganizationProvider } from '@nextsaas/auth'
import { ThemeProvider } from '@nextsaas/ui/client'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <OrganizationProvider>
          {children}
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}