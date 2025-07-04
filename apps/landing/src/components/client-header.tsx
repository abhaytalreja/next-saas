'use client';

import { Button, ThemeSwitcher, LanguageSelectorApp } from '@nextsaas/ui';
import Link from 'next/link';

export function ClientHeader() {
  return (
    <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
      <div className="text-2xl font-bold text-gray-900 dark:text-white">NextSaaS</div>
      <div className="flex gap-6 items-center">
        <Link href="http://localhost:3001" className="hover:text-gray-600 dark:hover:text-gray-300">
          Docs
        </Link>
        <Link href="/pricing" className="hover:text-gray-600 dark:hover:text-gray-300">
          Pricing
        </Link>
        <Link href="/blog" className="hover:text-gray-600 dark:hover:text-gray-300">
          Blog
        </Link>
        
        {/* Theme and Language Controls */}
        <div className="flex items-center gap-2">
          <LanguageSelectorApp showLabel />
          <ThemeSwitcher showLabel />
        </div>
        
        <Button variant="outline" size="sm">Sign In</Button>
        <Button size="sm">Get Started</Button>
      </div>
    </nav>
  );
}