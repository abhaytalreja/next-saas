'use client'

import React, { useState } from 'react'
import { useOrganization } from '@nextsaas/auth'
import { Button, Input, Alert } from '@nextsaas/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nextsaas/ui'
import { Building, TrashIcon, Users, Settings } from 'lucide-react'

export default function OrganizationSettingsPage() {
  const { currentOrganization, updateOrganization } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: currentOrganization?.name || '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentOrganization) return

    setLoading(true)
    setError(null)

    try {
      await updateOrganization(currentOrganization.id, formData)
      // Success handling
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      {/* Page Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Organization Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your organization profile, settings, and preferences.
        </p>
      </header>

      {/* Organization Tabs */}
      <main className="mt-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center space-x-2">
              <TrashIcon className="h-4 w-4" />
              <span>Danger Zone</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Organization Profile</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Update your organization's basic information
                </p>
              </div>
              <div className="p-6">
                {error && (
                  <Alert className="mb-4">
                    {error}
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter organization name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter organization description"
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Members</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Manage organization members and their roles
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Member management is available in the Team section</p>
                  <Button 
                    onClick={() => window.location.href = '/dashboard/team'}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Go to Team Management
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 shadow-sm">
              <div className="p-6 border-b border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2">
                  <TrashIcon className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Irreversible and destructive actions
                </p>
              </div>
              <div className="p-6">
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">Delete Organization</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Permanently delete this organization and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" disabled>
                    Delete Organization (Coming Soon)
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}