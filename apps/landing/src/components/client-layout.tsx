'use client'

import { ThemeProvider } from '@nextsaas/ui/client'
import { AuthProvider } from '@nextsaas/auth'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}
