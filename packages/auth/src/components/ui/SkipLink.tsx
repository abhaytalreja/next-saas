'use client'

import React from 'react'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`
        absolute top-0 left-0 z-50 p-2 bg-primary-600 text-white font-medium
        transform -translate-y-full focus:translate-y-0
        transition-transform duration-200 ease-in-out
        ${className}
      `}
      onFocus={(e) => {
        // Ensure the skip link is visible when focused
        e.currentTarget.scrollIntoView({ block: 'nearest' })
      }}
    >
      {children}
    </a>
  )
}

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
      <SkipLink href="#navigation">
        Skip to navigation
      </SkipLink>
    </div>
  )
}