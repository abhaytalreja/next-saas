'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminOrganization } from '../../types'
import { adminService } from '../../lib/admin-service'
import { OrganizationEditForm } from './OrganizationEditForm'
import { OrganizationMembers } from './OrganizationMembers'
import { OrganizationSettings } from './OrganizationSettings'
import { OrganizationBilling } from './OrganizationBilling'
import { OrganizationActivity } from './OrganizationActivity'
import { 
  ArrowLeft, 
  Building, 
  Edit3, 
  Ban, 
  CheckCircle, 
  Trash2,
  Users,
  Settings,
  CreditCard,
  Activity,
  Crown,
  Calendar,
  DollarSign,
  HardDrive
} from 'lucide-react'
import { Button } from '@nextsaas/ui'

interface OrganizationDetailsProps {
  organizationId: string
}

export function OrganizationDetails({ organizationId }: OrganizationDetailsProps) {
  const router = useRouter()
  const [organization, setOrganization] = useState<AdminOrganization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings' | 'billing' | 'activity'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchOrganization()
  }, [organizationId])

  const fetchOrganization = async () => {
    try {
      setLoading(true)
      const orgData = await adminService.getOrganizationById(organizationId)
      setOrganization(orgData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrganizationAction = async (action: string, reason?: string) => {
    if (!organization) return

    try {
      setActionLoading(action)
      
      switch (action) {
        case 'suspend':
          await adminService.suspendOrganization(organization.id, reason)
          break
        case 'activate':
          await adminService.activateOrganization(organization.id)
          break
        case 'delete':
          if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
            await adminService.deleteOrganization(organization.id)
            router.push('/admin/organizations')
            return
          }
          break
      }
      
      await fetchOrganization()
    } catch (error) {
      console.error(`Error ${action} organization:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSave = async (updates: Partial<AdminOrganization>) => {
    if (!organization) return

    try {
      await adminService.updateOrganization(organization.id, updates)
      setIsEditing(false)
      await fetchOrganization()
    } catch (error) {
      console.error('Error updating organization:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading organization</div>
          <p className="text-gray-600 mb-4">{error?.message || 'Organization not found'}</p>
          <Button onClick={() => router.push('/admin/organizations')}>
            Back to Organizations
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      deleted: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.active}`}>
        {status}
      </span>
    )
  }

  const getPlanBadge = (plan: string) => {
    const styles = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[plan as keyof typeof styles] || styles.free}`}>
        <Crown className="h-3 w-3 mr-1" />
        {plan}
      </span>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Building },
    { id: 'members', name: 'Members', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'activity', name: 'Activity', icon: Activity }
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/organizations')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {organization.name}
            </h1>
            <p className="text-gray-600">/{organization.slug}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {organization.status === 'active' ? (
            <Button
              variant="outline"
              onClick={() => handleOrganizationAction('suspend')}
              disabled={actionLoading === 'suspend'}
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => handleOrganizationAction('activate')}
              disabled={actionLoading === 'activate'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Activate
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => handleOrganizationAction('delete')}
            disabled={actionLoading === 'delete'}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Organization Overview Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
              <Building className="h-10 w-10 text-gray-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {organization.name}
              </h2>
              {getStatusBadge(organization.status)}
              {getPlanBadge(organization.plan)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {organization.member_count} members
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                ${organization.monthly_revenue}/month
              </div>
              <div className="flex items-center">
                <HardDrive className="h-4 w-4 mr-2" />
                {organization.storage_used}GB / {organization.storage_limit}GB
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Created {new Date(organization.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">{organization.member_count}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${organization.monthly_revenue}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">{organization.storage_used}GB</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(organization.storage_used / organization.storage_limit) * 100}%` }}
                ></div>
              </div>
            </div>
            <HardDrive className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{organization.plan}</p>
            </div>
            <Crown className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            isEditing ? (
              <OrganizationEditForm
                organization={organization}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <OrganizationOverview organization={organization} />
            )
          )}
          
          {activeTab === 'members' && (
            <OrganizationMembers organizationId={organization.id} />
          )}
          
          {activeTab === 'settings' && (
            <OrganizationSettings organizationId={organization.id} />
          )}
          
          {activeTab === 'billing' && (
            <OrganizationBilling organizationId={organization.id} />
          )}
          
          {activeTab === 'activity' && (
            <OrganizationActivity organizationId={organization.id} />
          )}
        </div>
      </div>
    </div>
  )
}

function OrganizationOverview({ organization }: { organization: AdminOrganization }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Organization Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{organization.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Slug</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">/{organization.slug}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Organization ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{organization.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  organization.status === 'active' ? 'bg-green-100 text-green-800' : 
                  organization.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {organization.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Details</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(organization.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(organization.updated_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {organization.owner.name || organization.owner.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Plan</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  organization.plan === 'enterprise' ? 'bg-yellow-100 text-yellow-800' :
                  organization.plan === 'pro' ? 'bg-purple-100 text-purple-800' :
                  organization.plan === 'starter' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  <Crown className="h-3 w-3 mr-1" />
                  {organization.plan}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Usage Stats */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usage & Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Members</span>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{organization.member_count}</div>
            <div className="text-xs text-gray-500">Active members</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Storage</span>
              <HardDrive className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{organization.storage_used}GB</div>
            <div className="text-xs text-gray-500">of {organization.storage_limit}GB limit</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${Math.min((organization.storage_used / organization.storage_limit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Revenue</span>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">${organization.monthly_revenue}</div>
            <div className="text-xs text-gray-500">Monthly recurring</div>
          </div>
        </div>
      </div>
    </div>
  )
}