'use client'

import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import { AdminMetrics, AdminUser, AdminOrganization, UserFilters, OrganizationFilters, PaginationParams, ApiResponse } from '../types'

class AdminService {
  private supabase = getSupabaseBrowserClient()

  async getDashboardMetrics(options: { signal?: AbortSignal } = {}): Promise<AdminMetrics> {
    try {
      const response = await fetch('/api/admin/analytics?type=metrics', {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: options.signal,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard metrics')
      }

      return result.data.metrics
    } catch (error) {
      // Re-throw AbortError without modification
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      
      console.error('Error fetching dashboard metrics:', error)
      throw new Error('Failed to fetch dashboard metrics')
    }
  }

  private async getUserMetrics() {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: totalUsers, error: totalError } = await this.supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)

    if (totalError) throw totalError

    const { data: newToday, error: newError } = await this.supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today)
      .is('deleted_at', null)

    if (newError) throw newError

    // For active users, we'll use last_seen_at within the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: activeUsers, error: activeError } = await this.supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('last_seen_at', sevenDaysAgo)
      .is('deleted_at', null)

    if (activeError) throw activeError

    return {
      total: totalUsers?.length || 0,
      active: activeUsers?.length || 0,
      newToday: newToday?.length || 0,
      growthRate: 5.2, // Calculate from historical data
      retentionRate: 85.3 // Calculate from user activity
    }
  }

  private async getOrganizationMetrics() {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: total, error: totalError } = await this.supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)

    if (totalError) throw totalError

    const { data: newToday, error: newError } = await this.supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today)
      .is('deleted_at', null)

    if (newError) throw newError

    return {
      total: total?.length || 0,
      active: total?.length || 0, // Assume all non-deleted orgs are active
      newToday: newToday?.length || 0,
      growthRate: 3.8
    }
  }

  private async getRevenueMetrics() {
    // This would integrate with your billing system
    // For now, return mock data
    return {
      mrr: 125000,
      total: 1500000,
      arpu: 89.50,
      growthRate: 12.5,
      churnRate: 2.1
    }
  }

  private async getSystemMetrics() {
    // This would integrate with your monitoring system
    // For now, return mock data
    return {
      uptime: 99.95,
      responseTime: 145,
      errorRate: 0.02,
      activeConnections: 1247
    }
  }

  private async getEmailMetrics() {
    // This would integrate with your email system
    // For now, return mock data
    return {
      sentToday: 15420,
      deliveryRate: 99.2,
      activeCampaigns: 8,
      subscribers: 125000
    }
  }

  private async getRecentActivity() {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        resource_type,
        created_at,
        user_id,
        details
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return data?.map((log: any) => ({
      id: log.id,
      description: `${log.action} ${log.resource_type}`,
      timestamp: log.created_at,
      type: log.resource_type as 'user' | 'organization' | 'system' | 'email' | 'billing',
      userId: log.user_id,
      metadata: log.details
    })) || []
  }

  async getUsers(filters: UserFilters = {}, pagination: PaginationParams): Promise<ApiResponse<AdminUser[]>> {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: pagination.sort || 'created_at',
        order: pagination.order || 'desc',
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.role && { role: filters.role }),
        ...(filters.organizationId && { organizationId: filters.organizationId })
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new Error('Failed to fetch users')
    }
  }

  async getOrganizations(filters: OrganizationFilters = {}, pagination: PaginationParams): Promise<ApiResponse<AdminOrganization[]>> {
    let query = this.supabase
      .from('organizations')
      .select(`
        id,
        name,
        slug,
        created_at,
        updated_at,
        memberships!inner(
          user_id,
          role,
          users(id, name, email)
        )
      `)
      .is('deleted_at', null)

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`)
    }

    // Apply pagination
    const start = (pagination.page - 1) * pagination.limit
    const end = start + pagination.limit - 1
    
    const { data, error, count } = await query
      .range(start, end)
      .order(pagination.sort || 'created_at', { ascending: pagination.order === 'asc' })

    if (error) throw error

    const organizations: AdminOrganization[] = data?.map((org: any) => {
      const owner = org.memberships?.find((m: any) => m.role === 'owner')
      
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: 'active',
        plan: 'pro', // Would come from subscription data
        member_count: org.memberships?.length || 0,
        monthly_revenue: 0, // Would come from billing data
        storage_used: 0, // Would come from usage data
        storage_limit: 100, // Would come from plan data
        created_at: org.created_at,
        updated_at: org.updated_at,
        owner: {
          id: owner?.users?.id || '',
          name: owner?.users?.name || '',
          email: owner?.users?.email || ''
        }
      }
    }) || []

    return {
      data: organizations,
      success: true,
      metadata: {
        total: count || 0,
        page: pagination.page,
        limit: pagination.limit
      }
    }
  }

  // User management actions
  async getUserById(userId: string): Promise<AdminUser> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<void> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Failed to update user')
    }
  }

  async suspendUser(userId: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suspend: true, reason })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error suspending user:', error)
      throw new Error('Failed to suspend user')
    }
  }

  async activateUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activate: true })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error activating user:', error)
      throw new Error('Failed to activate user')
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Failed to delete user')
    }
  }

  async bulkUserAction(action: string, userIds: string[], data?: any): Promise<any> {
    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          user_ids: userIds,
          ...data
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      throw new Error('Failed to perform bulk action')
    }
  }

  async createUser(userData: { email: string; name?: string; send_invitation?: boolean }): Promise<any> {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  // Organization management actions
  async getOrganizationById(organizationId: string): Promise<AdminOrganization> {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error fetching organization:', error)
      throw new Error('Failed to fetch organization')
    }
  }

  async updateOrganization(organizationId: string, updates: Partial<AdminOrganization>): Promise<void> {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error updating organization:', error)
      throw new Error('Failed to update organization')
    }
  }

  async suspendOrganization(organizationId: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suspend: true, reason })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error suspending organization:', error)
      throw new Error('Failed to suspend organization')
    }
  }

  async activateOrganization(organizationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activate: true })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error activating organization:', error)
      throw new Error('Failed to activate organization')
    }
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting organization:', error)
      throw new Error('Failed to delete organization')
    }
  }

  async createOrganization(orgData: { name: string; slug: string; owner_email: string }): Promise<any> {
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orgData)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating organization:', error)
      throw new Error('Failed to create organization')
    }
  }
}

export const adminService = new AdminService()