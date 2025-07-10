'use client'

import React, { useState } from 'react'
import { UpdatePasswordForm } from '@nextsaas/auth'
import { useAuth } from '@nextsaas/auth'
import { Button, Alert } from '@nextsaas/ui'
import { SecurityDashboard } from '@/packages/auth/src/components/security/SecurityDashboard'
import { UserSessionManager } from '@/packages/auth/src/components/security/UserSessionManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nextsaas/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nextsaas/ui'
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  Globe,
  Clock,
  AlertTriangle,
  Activity,
  Lock
} from 'lucide-react'

export default function SecuritySettingsPage() {
  const { user } = useAuth()

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Security & Privacy
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account security, sessions, and privacy settings to keep your data safe.
        </p>
      </div>

      {/* Security Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="password" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="password" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Password</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Password Management</span>
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpdatePasswordForm className="max-w-xl" />
              </CardContent>
            </Card>

            {/* Password Strength Information */}
            <Card>
              <CardHeader>
                <CardTitle>Password Security</CardTitle>
                <CardDescription>
                  Guidelines for creating a strong password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">At least 8 characters long</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Contains uppercase and lowercase letters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Includes numbers and special characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Unique to this account</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Active Sessions</span>
                </CardTitle>
                <CardDescription>
                  Manage devices and sessions that have access to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserSessionManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Security Activity</span>
                </CardTitle>
                <CardDescription>
                  Monitor login attempts, security events, and account changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Two-Factor Authentication</span>
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Shield className="h-12 w-12 text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Two-factor authentication is not enabled
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Protect your account with an additional verification step when signing in.
                    </p>
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Enable Two-Factor Authentication
                    </Button>
                    
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="text-sm">
                        <strong>Coming Soon:</strong> Two-factor authentication will be available in the next update.
                      </p>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Preferences</CardTitle>
                <CardDescription>
                  Configure additional security settings for your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Login notifications</p>
                    <p className="text-sm text-gray-500">Get notified of new sign-ins to your account</p>
                  </div>
                  <div className="text-sm text-green-600 font-medium">Enabled</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Session timeout</p>
                    <p className="text-sm text-gray-500">Automatically sign out after inactivity</p>
                  </div>
                  <div className="text-sm text-gray-600">30 minutes</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Security alerts</p>
                    <p className="text-sm text-gray-500">Get alerts about suspicious account activity</p>
                  </div>
                  <div className="text-sm text-green-600 font-medium">Enabled</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Security Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-3">
          Security Best Practices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-start">
              <span className="block mt-0.5 mr-2">•</span>
              <span>Use a strong, unique password for your account</span>
            </div>
            <div className="flex items-start">
              <span className="block mt-0.5 mr-2">•</span>
              <span>Enable two-factor authentication when available</span>
            </div>
            <div className="flex items-start">
              <span className="block mt-0.5 mr-2">•</span>
              <span>Regularly review active sessions and devices</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-start">
              <span className="block mt-0.5 mr-2">•</span>
              <span>Monitor your account activity for suspicious behavior</span>
            </div>
            <div className="flex items-start">
              <span className="block mt-0.5 mr-2">•</span>
              <span>Keep your contact information up to date</span>
            </div>
            <div className="flex items-start">
              <span className="block mt-0.5 mr-2">•</span>
              <span>Be cautious of phishing attempts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}