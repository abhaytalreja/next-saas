import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppSidebar } from '@/components/navigation/app-sidebar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NextSaaS - Modern SaaS Starter',
  description: 'A modern SaaS application built with Next.js 15 and Turborepo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
