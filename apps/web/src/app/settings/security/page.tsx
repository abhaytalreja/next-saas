'use client'

import React, { useState } from 'react'
import { UpdatePasswordForm } from '@/packages/auth'
import { useAuth } from '@/packages/auth'
import { Button, Alert } from '@/packages/ui'
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default function SecuritySettingsPage() {
  const { user, signOut } = useAuth()
  const [showSessions, setShowSessions] = useState(false)

  // Mock session data - in production, this would come from an API
  const sessions = [
    {
      id: '1',
      device: 'Chrome on MacOS',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.1',
      lastActive: 'Active now',
      current: true,
      icon: ComputerDesktopIcon,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.2',
      lastActive: '2 hours ago',
      current: false,
      icon: DevicePhoneMobileIcon,
    },
  ]

  const handleSignOutAllDevices = async () => {
    if (confirm('Are you sure you want to sign out from all devices? You will need to sign in again.')) {
      await signOut()
    }
  }

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Security Settings</h2>
        <p className="mt-2 text-sm text-gray-600">
          Manage your password and security preferences to keep your account safe.
        </p>
      </div>

      {/* Password Section */}
      <div>
        <div className="flex items-center mb-4">
          <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Password</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <UpdatePasswordForm className="max-w-xl" />
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div>
        <div className="flex items-center mb-4">
          <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-12 w-12 text-gray-300" />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                Two-factor authentication is not enabled
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                Add an extra layer of security to your account by enabling two-factor authentication.
                You'll need to enter a code from your authenticator app when you sign in.
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </div>
          </div>

          <Alert type="info" className="mt-4">
            <p className="text-sm">
              <strong>Coming Soon:</strong> Two-factor authentication will be available in the next update.
            </p>
          </Alert>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ComputerDesktopIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
          </div>
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            {showSessions ? 'Hide' : 'Show'} sessions
          </button>
        </div>

        {showSessions && (
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            {sessions.map((session) => (
              <div key={session.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <session.icon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Current session
                          </span>
                        )}
                      </p>
                      <div className="mt-1 text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <GlobeAltIcon className="h-4 w-4 mr-1" />
                          {session.location} • {session.ipAddress}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {session.lastActive}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="p-4 bg-gray-50">
              <button
                onClick={handleSignOutAllDevices}
                className="text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Sign out all other sessions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Activity */}
      <div>
        <div className="flex items-center mb-4">
          <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Recent Security Activity</h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg">
          <ul className="divide-y divide-gray-200">
            <li className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">Successful login from Chrome on MacOS</p>
                  <p className="text-xs text-gray-500">San Francisco, CA • 2 hours ago</p>
                </div>
              </div>
            </li>
            <li className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">Password changed</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Account Security Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-3">Keep your account secure</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="block mt-0.5 mr-2">•</span>
            <span>Use a strong, unique password that you don't use on other websites</span>
          </li>
          <li className="flex items-start">
            <span className="block mt-0.5 mr-2">•</span>
            <span>Enable two-factor authentication for an extra layer of security</span>
          </li>
          <li className="flex items-start">
            <span className="block mt-0.5 mr-2">•</span>
            <span>Review your active sessions regularly and revoke access for unrecognized devices</span>
          </li>
          <li className="flex items-start">
            <span className="block mt-0.5 mr-2">•</span>
            <span>Be cautious of phishing emails asking for your password or personal information</span>
          </li>
        </ul>
      </div>
    </div>
  )
}