import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClientLayout } from '@/components/client-layout'
import { ConditionalLayout } from '@/components/conditional-layout'
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
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.className} h-full bg-white dark:bg-gray-900 transition-colors`}>
        <ClientLayout>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ClientLayout>
      </body>
    </html>
  )
}
