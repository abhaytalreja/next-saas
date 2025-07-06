'use client'

import React from 'react'
import { AuthLayout } from '../../../components/layouts/AuthLayout'
import { LoginForm } from '../../../components/forms/LoginForm'
import { SocialAuthButtons } from '../../../components/providers/SocialAuthButtons'

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={
        <>
          Or{' '}
          <a
            href="/auth/signup"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            create a new account
          </a>
        </>
      }
    >
      <div className="space-y-6">
        <LoginForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <SocialAuthButtons />
      </div>
    </AuthLayout>
  )
}
