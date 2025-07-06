'use client'

import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { SocialLoginButton } from './SocialLoginButton'
import type { OAuthProvider } from '../../types'

interface SocialAuthButtonsProps {
  providers?: OAuthProvider[]
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: string) => void
  fullWidth?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'outline' | 'default'
}

const defaultProviders: OAuthProvider[] = ['google', 'github', 'microsoft']

export function SocialAuthButtons({
  providers = defaultProviders,
  redirectTo,
  onSuccess,
  onError,
  fullWidth = true,
  size = 'default',
  variant = 'outline',
}: SocialAuthButtonsProps) {
  const { signInWithOAuth } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
    null
  )

  const handleSocialLogin = async (provider: OAuthProvider) => {
    setLoadingProvider(provider)

    try {
      const { error } = await signInWithOAuth({
        provider,
        redirectTo,
      })

      if (error) {
        onError?.(error.message)
        setLoadingProvider(null)
        return
      }

      onSuccess?.()
    } catch (err: any) {
      onError?.(err.message || 'Failed to authenticate with provider')
      setLoadingProvider(null)
    }
  }

  return (
    <div className="space-y-3">
      {providers.map(provider => (
        <SocialLoginButton
          key={provider}
          provider={provider}
          onClick={() => handleSocialLogin(provider)}
          loading={loadingProvider === provider}
          disabled={loadingProvider !== null}
          fullWidth={fullWidth}
          size={size}
          variant={variant}
        />
      ))}
    </div>
  )
}
