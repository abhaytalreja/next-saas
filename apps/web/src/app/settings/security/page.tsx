'use client'

import React, { useState } from 'react'
import { UpdatePasswordForm } from '@nextsaas/auth'
import { useAuth } from '@nextsaas/auth'
import { Button, Alert } from '@nextsaas/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nextsaas/ui'
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  Lock
} from 'lucide-react'

export default function SecuritySettingsPage() {
  const { user } = useAuth()

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      {/* Page Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Security Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your account security, password, and two-factor authentication.
        </p>
      </header>

      {/* Security Tabs */}
      <main className="mt-6">
        <Tabs defaultValue="password" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Password</span>
            </TabsTrigger>
            <TabsTrigger value="2fa" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>2FA</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Sessions</span>
            </TabsTrigger>
          </TabsList>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Password</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Update your password to keep your account secure
                </p>
              </div>
              <div className="p-6">
                <UpdatePasswordForm />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Password Security</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Review your password strength and security recommendations
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200">Password strength: Strong</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>• Use a unique password for this account</p>
                    <p>• Include uppercase and lowercase letters</p>
                    <p>• Include numbers and special characters</p>
                    <p>• Make it at least 12 characters long</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 2FA Tab */}
          <TabsContent value="2fa">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <Smartphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Two-factor authentication setup coming soon</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Sessions</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Manage your active sessions and devices
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <Monitor className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Session management coming soon</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}