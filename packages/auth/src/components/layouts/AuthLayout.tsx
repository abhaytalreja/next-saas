'use client'

import React from 'react'
import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showLogo?: boolean
  logoSrc?: string
  logoAlt?: string
  backgroundImage?: string
  footer?: React.ReactNode
  'data-testid'?: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
  logoSrc,
  logoAlt = 'Logo',
  backgroundImage,
  footer,
  'data-testid': dataTestId,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex" data-testid={dataTestId || 'auth-layout'}>
      {/* Left side - Auth form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24" data-testid="auth-form-section">
        <div className="mx-auto w-full max-w-sm lg:w-96" data-testid="auth-form-container">
          {showLogo && (
            <div className="mb-8">
              <Link href="/" className="flex justify-center" data-testid="auth-logo-link">
                {logoSrc ? (
                  <img className="h-12 w-auto" src={logoSrc} alt={logoAlt} />
                ) : (
                  <div className="text-3xl font-bold text-primary-600">
                    NextSaaS
                  </div>
                )}
              </Link>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-center text-3xl font-extrabold text-gray-900" data-testid="auth-title">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-center text-sm text-gray-600" data-testid="auth-subtitle">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {footer && <div className="mt-8" data-testid="auth-footer">{footer}</div>}
        </div>
      </div>

      {/* Right side - Background image */}
      <div className="hidden lg:block relative w-0 flex-1" data-testid="auth-background-section">
        {backgroundImage ? (
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={backgroundImage}
            alt=""
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700" />
        )}
        <div className="absolute inset-0 bg-black opacity-10" />

        {/* Optional content overlay */}
        <div className="relative h-full flex items-center justify-center p-12" data-testid="auth-background-content">
          <div className="max-w-md text-white">
            <h3 className="text-4xl font-bold mb-4">Build your SaaS faster</h3>
            <p className="text-lg opacity-90">
              Start with a complete authentication system, multi-tenant
              architecture, and all the features you need to launch your SaaS
              product.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
