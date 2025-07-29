'use client'

import React, { useState } from 'react'
import { Button } from '@nextsaas/ui'
import { 
  Settings, 
  Save, 
  AlertTriangle,
  Lock,
  Globe,
  Database,
  Mail
} from 'lucide-react'

interface OrganizationSettingsProps {
  organizationId: string
}

export function OrganizationSettings({ organizationId }: OrganizationSettingsProps) {
  const [settings, setSettings] = useState({
    general: {
      timezone: 'UTC',
      language: 'en',
      dateFormat: 'MM/DD/YYYY'
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 30,
      allowedDomains: ''
    },
    features: {
      apiAccess: true,
      webhooks: true,
      dataExport: true
    },
    limits: {
      storageLimit: 100,
      memberLimit: 50,
      apiRequestLimit: 10000
    }
  })

  const [loading, setLoading] = useState(false)

  const handleSave = async (section: string) => {
    try {
      setLoading(true)
      // TODO: Implement actual API call to save settings
      console.log(`Saving ${section} settings for organization ${organizationId}:`, settings[section as keyof typeof settings])
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Organization Settings</h3>
        <p className="text-sm text-gray-600">
          Configure organization-wide preferences and security settings.
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-gray-600" />
            <h4 className="text-md font-medium text-gray-900">General Settings</h4>
          </div>
          <Button 
            size="sm" 
            onClick={() => handleSave('general')}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={settings.general.language}
              onChange={(e) => updateSetting('general', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              value={settings.general.dateFormat}
              onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-gray-600" />
            <h4 className="text-md font-medium text-gray-900">Security Settings</h4>
          </div>
          <Button 
            size="sm" 
            onClick={() => handleSave('security')}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Require Two-Factor Authentication
              </label>
              <p className="text-sm text-gray-500">
                All members must enable 2FA to access the organization.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.twoFactorRequired}
              onChange={(e) => updateSetting('security', 'twoFactorRequired', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                min="5"
                max="480"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allowed Email Domains
              </label>
              <input
                type="text"
                value={settings.security.allowedDomains}
                onChange={(e) => updateSetting('security', 'allowedDomains', e.target.value)}
                placeholder="example.com, company.org"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated list. Leave empty to allow all domains.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h4 className="text-md font-medium text-gray-900">Feature Access</h4>
          </div>
          <Button 
            size="sm" 
            onClick={() => handleSave('features')}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(settings.features).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
                <p className="text-sm text-gray-500">
                  {key === 'apiAccess' && 'Allow programmatic access to organization data'}
                  {key === 'webhooks' && 'Enable webhook notifications for events'}
                  {key === 'dataExport' && 'Allow members to export organization data'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateSetting('features', key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Usage Limits */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-600" />
            <h4 className="text-md font-medium text-gray-900">Usage Limits</h4>
          </div>
          <Button 
            size="sm" 
            onClick={() => handleSave('limits')}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Storage Limit (GB)
            </label>
            <input
              type="number"
              value={settings.limits.storageLimit}
              onChange={(e) => updateSetting('limits', 'storageLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member Limit
            </label>
            <input
              type="number"
              value={settings.limits.memberLimit}
              onChange={(e) => updateSetting('limits', 'memberLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Requests/Month
            </label>
            <input
              type="number"
              value={settings.limits.apiRequestLimit}
              onChange={(e) => updateSetting('limits', 'apiRequestLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              min="100"
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h4 className="text-md font-medium text-red-900">Danger Zone</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-red-900">Reset Organization</h5>
              <p className="text-sm text-red-700">
                Remove all data and reset organization to default state.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-red-900">Delete Organization</h5>
              <p className="text-sm text-red-700">
                Permanently delete this organization and all associated data.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}