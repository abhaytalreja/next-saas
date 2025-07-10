'use client'

import React, { useState } from 'react'
import { useOrganization } from '@nextsaas/auth'
import { Button, Input, Alert } from '@nextsaas/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nextsaas/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nextsaas/ui'
import { OrganizationProfileForm } from '@/packages/auth/src/components/profile/OrganizationProfileForm'
import { OrganizationDirectory } from '@/packages/auth/src/components/profile/OrganizationDirectory'
import { Building, TrashIcon, Users, Settings, User, Directory } from 'lucide-react'

export default function OrganizationSettingsPage() {
  const { currentOrganization, updateOrganization } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [organizationName, setOrganizationName] = useState(
    currentOrganization?.name || ''
  )
  const [organizationSlug, setOrganizationSlug] = useState(
    currentOrganization?.slug || ''
  )
  const [organizationWebsite, setOrganizationWebsite] = useState(
    currentOrganization?.website || ''
  )
  const [organizationDescription, setOrganizationDescription] = useState(
    currentOrganization?.description || ''
  )

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateOrganization(currentOrganization?.id!, {
        name: organizationName,
        slug: organizationSlug,
        website: organizationWebsite,
        description: organizationDescription,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update organization')
    } finally {
      setLoading(false)
    }
  }

  if (!currentOrganization) {
    return (
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <Alert type="error">
          No organization found. Please create or join an organization first.
        </Alert>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Organization Management
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Manage your organization settings, profile, and team directory.
        </p>
      </div>

      {/* Organization Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </TabsTrigger>
            <TabsTrigger value="directory" className="flex items-center space-x-2">
              <Directory className="h-4 w-4" />
              <span>Directory</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-2">
              <TrashIcon className="h-4 w-4" />
              <span>Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {error && (
              <Alert type="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert type="success" onClose={() => setSuccess(false)}>
                Organization settings updated successfully!
              </Alert>
            )}

            {/* Organization Details Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Organization Details</span>
                </CardTitle>
                <CardDescription>
                  Update your organization's basic information and branding.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateOrganization} className="space-y-6">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {/* Organization Logo */}
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Organization Logo
                      </label>
                      <div className="mt-2 flex items-center gap-x-3">
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building className="h-10 w-10 text-gray-400" />
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          Change Logo
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Logo upload functionality coming soon.
                      </p>
                    </div>

                    {/* Organization Name */}
                    <div className="sm:col-span-4">
                      <Input
                        label="Organization Name"
                        type="text"
                        value={organizationName}
                        onChange={e => setOrganizationName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Organization Slug */}
                    <div className="sm:col-span-4">
                      <Input
                        label="Organization Slug"
                        type="text"
                        value={organizationSlug}
                        onChange={e => setOrganizationSlug(e.target.value)}
                        helperText="Used in URLs and must be unique"
                        required
                      />
                    </div>

                    {/* Website */}
                    <div className="sm:col-span-4">
                      <Input
                        label="Website"
                        type="url"
                        value={organizationWebsite}
                        onChange={e => setOrganizationWebsite(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Description
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="description"
                          rows={3}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                          value={organizationDescription}
                          onChange={e => setOrganizationDescription(e.target.value)}
                          placeholder="What does your organization do?"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-4">
                    <Button type="submit" loading={loading} disabled={loading}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  View your organization's metadata and system information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-6 divide-y divide-gray-100 text-sm leading-6">
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
                      Organization ID
                    </dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900 font-mono">
                        {currentOrganization.id}
                      </div>
                    </dd>
                  </div>
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
                      Created
                    </dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900">
                        {new Date(currentOrganization.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </div>
                    </dd>
                  </div>
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
                      Plan
                    </dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900">
                        {currentOrganization.plan || 'Free Plan'}
                        <span className="ml-2 text-sm text-gray-500">
                          <a
                            href="/settings/organization/billing"
                            className="text-primary-600 hover:text-primary-500"
                          >
                            Upgrade
                          </a>
                        </span>
                      </div>
                    </dd>
                  </div>
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
                      Members
                    </dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900">
                        {currentOrganization.memberships_count || 0} member(s)
                        <span className="ml-2 text-sm text-gray-500">
                          <a
                            href="/settings/organization/members"
                            className="text-primary-600 hover:text-primary-500"
                          >
                            Manage
                          </a>
                        </span>
                      </div>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization Profile Tab */}
          <TabsContent value="profile">
            <OrganizationProfileForm />
          </TabsContent>

          {/* Directory Tab */}
          <TabsContent value="directory">
            <OrganizationDirectory />
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  These actions are irreversible and will permanently affect your organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-900 mb-2">
                    Delete Organization
                  </h4>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete an organization, there is no going back. All data, 
                    members, and settings will be permanently removed.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Organization
                  </Button>
                </div>

                <div className="border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">
                    Transfer Ownership
                  </h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    Transfer ownership of this organization to another member.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Transfer Ownership
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}