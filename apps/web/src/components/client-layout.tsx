'use client'

import { AuthProvider } from '@nextsaas/auth'
import { ThemeProvider } from '@nextsaas/ui/client'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}