'use client'

import React, { useState } from 'react'
import { AdminOrganization } from '../../types'
import { Button } from '@nextsaas/ui'
import { Save, X } from 'lucide-react'

interface OrganizationEditFormProps {
  organization: AdminOrganization
  onSave: (updates: Partial<AdminOrganization>) => Promise<void>
  onCancel: () => void
}

export function OrganizationEditForm({ organization, onSave, onCancel }: OrganizationEditFormProps) {
  const [formData, setFormData] = useState({
    name: organization.name,
    slug: organization.slug,
    status: organization.status,
    plan: organization.plan
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      await onSave(formData)
    } catch (error) {
      console.error('Error saving organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter organization name"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                /
              </span>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className={`flex-1 px-3 py-2 border rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="organization-slug"
              />
            </div>
            {errors.slug && (
              <p className="text-red-600 text-sm mt-1">{errors.slug}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              This will be used in URLs. Only lowercase letters, numbers, and hyphens allowed.
            </p>
          </div>
        </div>

        {/* Organization Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Organization Settings</h3>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Plan
            </label>
            <select
              id="plan"
              value={formData.plan}
              onChange={(e) => handleInputChange('plan', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <ul className="mt-1 space-y-1">
                <li>• Changing the slug will affect all existing URLs</li>
                <li>• Suspending will disable organization access</li>
                <li>• Plan changes may affect billing and features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}