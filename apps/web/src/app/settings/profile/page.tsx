'use client'

import React from 'react'
import { ProfileForm } from '@/packages/auth'
import { useAuth } from '@/packages/auth'

export default function ProfileSettingsPage() {
  const { user } = useAuth()

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
        <p className="mt-2 text-sm text-gray-600">
          Update your personal information and manage how others see you.
        </p>
      </div>

      {/* Profile Form */}
      <div className="mt-6">
        <ProfileForm className="max-w-2xl" />
      </div>

      {/* Additional Information */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <dl className="divide-y divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-mono">
              {user?.id}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Account Created</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : 'N/A'}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {user?.email_confirmed_at ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Unverified
                </span>
              )}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Authentication Method</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {user?.app_metadata?.provider === 'email' ? 'Email/Password' : 
               user?.app_metadata?.provider ? `OAuth (${user.app_metadata.provider})` : 'N/A'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Delete Account</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}