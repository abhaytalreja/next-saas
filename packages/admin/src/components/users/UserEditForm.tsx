'use client'

import React, { useState } from 'react'
import { AdminUser } from '../../types'
import { Button } from '@nextsaas/ui'
import { Save, X } from 'lucide-react'

interface UserEditFormProps {
  user: AdminUser
  onSave: (updates: Partial<AdminUser>) => Promise<void>
  onCancel: () => void
}

export function UserEditForm({ user, onSave, onCancel }: UserEditFormProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email,
    status: user.status,
    is_system_admin: user.is_system_admin
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
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
      console.error('Error saving user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
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
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Account Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="invited">Invited</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_system_admin"
              checked={formData.is_system_admin}
              onChange={(e) => handleInputChange('is_system_admin', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_system_admin" className="ml-2 block text-sm text-gray-900">
              System Administrator
            </label>
          </div>
          <p className="text-sm text-gray-500">
            System administrators have full access to the admin panel and can manage all aspects of the platform.
          </p>
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