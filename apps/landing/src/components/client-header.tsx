'use client'

import { Button } from '@nextsaas/ui'
import { ThemeSwitcher, LanguageSelectorApp } from '@nextsaas/ui/client'
import Link from 'next/link'

export function ClientHeader() {
  return (
    <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        NextSaaS
      </div>
      <div className="flex gap-6 items-center">
        <Link
          href="http://localhost:3001"
          className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Docs
        </Link>
        <Link
          href="/pricing"
          className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Pricing
        </Link>
        <Link
          href="/blog"
          className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Blog
        </Link>

        {/* Theme and Language Controls */}
        <div className="flex items-center gap-2">
          <LanguageSelectorApp showLabel />
          <ThemeSwitcher showLabel />
        </div>

        <Link href="http://localhost:3000/auth/sign-in">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="http://localhost:3000/auth/sign-up">
          <Button size="sm">Get Started</Button>
        </Link>
      </div>
    </nav>
  )
}
