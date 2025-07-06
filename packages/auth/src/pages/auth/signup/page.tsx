'use client'

import React from 'react'
import { AuthLayout } from '../../../components/layouts/AuthLayout'
import { SignupForm } from '../../../components/forms/SignupForm'
import { SocialAuthButtons } from '../../../components/providers/SocialAuthButtons'

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have an account?{' '}
          <a
            href="/auth/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </a>
        </>
      }
    >
      <div className="space-y-6">
        <SocialAuthButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Or sign up with email
            </span>
          </div>
        </div>

        <SignupForm />
      </div>
    </AuthLayout>
  )
}
