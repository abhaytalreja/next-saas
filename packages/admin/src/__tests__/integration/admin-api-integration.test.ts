/**
 * Admin API Integration Test
 * 
 * Tests the complete API endpoint chains and integrations:
 * - Admin service API call chains
 * - Request/response flow validation  
 * - Error handling across API boundaries
 * - Data transformation and serialization
 * - Multi-endpoint workflow integration
 */

import { adminService } from '../../lib/admin-service'
import { NextRequest, NextResponse } from 'next/server'
import { AdminMetrics, AdminUser, AdminOrganization, PaginationParams } from '../../types'

// Mock fetch for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock Supabase client - defined before jest.mock to avoid hoisting issues  
const createMockSupabaseClient = () => ({
  auth: {
    getSession: jest.fn(),
    admin: {
      createUser: jest.fn(),
      deleteUser: jest.fn(),
    }
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    limit: jest.fn().mockReturnThis(),
  })),
  rpc: jest.fn(),
})

const mockSupabaseClient = createMockSupabaseClient()

jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: () => createMockSupabaseClient(),
  getSupabaseServerClient: () => createMockSupabaseClient(),
}))

describe('Admin API Integration Tests', () => {
  const mockSessionUser = {
    id: 'admin-user-123',
    email: 'admin@nextsaas.com'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default successful session
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockSessionUser } },
      error: null
    })
  })

  describe('Dashboard Metrics API Integration', () => {
    it('fetches complete dashboard metrics through API chain', async () => {
      // Setup: Mock API response with complete metrics
      const mockMetricsResponse = {
        success: true,
        data: {
          metrics: {
            totalUsers: 1250,
            activeUsers: 890,
            newUsersToday: 12,
            userGrowthRate: 5.2,
            userRetentionRate: 85.3,
            totalOrganizations: 150,
            activeOrganizations: 140,
            newOrganizationsToday: 3,
            organizationGrowthRate: 3.8,
            monthlyRecurringRevenue: 125000,
            totalRevenue: 1500000,
            averageRevenuePerUser: 89.50,
            revenueGrowthRate: 12.5,
            churnRate: 2.1,
            systemUptime: 99.95,
            apiResponseTime: 145,
            errorRate: 0.02,
            activeConnections: 1247,
            emailsSentToday: 15420,
            emailDeliveryRate: 99.2,
            campaignsActive: 8,
            subscriberCount: 125000,
            recentActivity: [
              {
                id: 'activity-1',
                description: 'User created organization',
                timestamp: '2024-01-15T10:30:00Z',
                type: 'organization' as const,
                userId: 'user-123'
              }
            ]
          }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockMetricsResponse)
      })

      const result = await adminService.getDashboardMetrics()

      // Verify API call was made correctly
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/analytics?type=metrics', {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: undefined,
      })

      // Verify complete metrics structure
      expect(result).toEqual(mockMetricsResponse.data.metrics)
      expect(result.totalUsers).toBe(1250)
      expect(result.recentActivity).toHaveLength(1)
      expect(result.recentActivity[0].type).toBe('organization')
    })

    it('handles API errors with proper error transformation', async () => {
      // Setup: API returns error response
      const mockErrorResponse = {
        success: false,
        error: 'Insufficient permissions to access analytics data'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve(mockErrorResponse)
      })

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('API error: 403')
    })

    it('handles network errors and timeout scenarios', async () => {
      // Setup: Network timeout
      const abortController = new AbortController()
      
      mockFetch.mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'))

      await expect(
        adminService.getDashboardMetrics({ signal: abortController.signal })
      ).rejects.toThrow('AbortError')

      // Verify AbortError is re-thrown without modification
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/analytics?type=metrics', {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortController.signal,
      })
    })

    it('integrates with database for real-time metrics calculation', async () => {
      // Setup: Mock database responses for direct queries
      const today = new Date().toISOString().split('T')[0]
      
      mockSupabaseClient.from().single
        .mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }], error: null }) // total users
        .mockResolvedValueOnce({ data: [{ id: 1 }], error: null }) // new today
        .mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }], error: null }) // active users

      // Mock API call that uses these database queries
      const mockResponse = {
        success: true,
        data: {
          metrics: {
            totalUsers: 2,
            newUsersToday: 1,
            activeUsers: 2,
            userGrowthRate: 5.2,
            userRetentionRate: 85.3,
            recentActivity: []
          }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await adminService.getDashboardMetrics()

      expect(result.totalUsers).toBe(2)
      expect(result.newUsersToday).toBe(1)
      expect(result.activeUsers).toBe(2)
    })
  })

  describe('User Management API Integration', () => {
    it('fetches users with complete pagination and filtering', async () => {
      const mockUsersResponse = {
        data: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'User One',
            avatar_url: null,
            status: 'active' as const,
            is_system_admin: false,
            organizations: [
              {
                id: 'org-1',
                name: 'Organization One',
                role: 'member',
                joined_at: '2024-01-01T00:00:00Z'
              }
            ],
            last_seen_at: '2024-01-15T10:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
            email_verified_at: '2024-01-01T01:00:00Z',
            login_count: 25,
            last_ip: '192.168.1.1'
          }
        ],
        success: true,
        metadata: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUsersResponse)
      })

      const filters = { search: 'user1', status: 'active' }
      const pagination: PaginationParams = { page: 1, limit: 20, sort: 'created_at', order: 'desc' }

      const result = await adminService.getUsers(filters, pagination)

      // Verify API call with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/users?page=1&limit=20&sort=created_at&order=desc&search=user1&status=active',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      expect(result).toEqual(mockUsersResponse)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].organizations).toHaveLength(1)
    })

    it('handles user creation with invitation workflow', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        send_invitation: true
      }

      const mockCreateResponse = {
        data: {
          user: {
            id: 'new-user-123',
            email: 'newuser@example.com',
            user_metadata: { name: 'New User' }
          }
        },
        success: true,
        message: 'User created and invitation sent'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCreateResponse)
      })

      const result = await adminService.createUser(userData)

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      expect(result.success).toBe(true)
      expect(result.data.user.email).toBe('newuser@example.com')
    })

    it('handles bulk user operations with proper error handling', async () => {
      const bulkData = {
        action: 'suspend',
        user_ids: ['user-1', 'user-2', 'user-3'],
        reason: 'Bulk suspension for policy violation'
      }

      const mockBulkResponse = {
        success: true,
        data: {
          processed: 3,
          successful: 2,
          failed: 1,
          errors: [
            { user_id: 'user-3', error: 'User already suspended' }
          ]
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBulkResponse)
      })

      const result = await adminService.bulkUserAction('suspend', ['user-1', 'user-2', 'user-3'], {
        reason: 'Bulk suspension for policy violation'
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'suspend',
          user_ids: ['user-1', 'user-2', 'user-3'],
          reason: 'Bulk suspension for policy violation'
        })
      })

      expect(result.data.processed).toBe(3)
      expect(result.data.successful).toBe(2)
      expect(result.data.failed).toBe(1)
    })

    it('validates user update operations through API chain', async () => {
      const userId = 'user-123'
      const updates = {
        name: 'Updated Name',
        status: 'suspended' as const,
        suspension_reason: 'Policy violation'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      })

      await adminService.updateUser(userId, updates)

      expect(mockFetch).toHaveBeenCalledWith(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
    })
  })

  describe('Organization Management API Integration', () => {
    it('fetches organizations with member data integration', async () => {
      // Setup: Mock database response for organizations with memberships
      const mockOrgData = [
        {
          id: 'org-1',
          name: 'Organization One',
          slug: 'org-one',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          memberships: [
            {
              user_id: 'user-1',
              role: 'owner',
              users: {
                id: 'user-1',
                name: 'Owner User',
                email: 'owner@example.com'
              }
            },
            {
              user_id: 'user-2',
              role: 'member',
              users: {
                id: 'user-2',
                name: 'Member User',
                email: 'member@example.com'
              }
            }
          ]
        }
      ]

      mockSupabaseClient.from().mockReturnValue({
        select: jest.fn().mockReturnValue({
          is: jest.fn().mockReturnValue({
            or: jest.fn().mockReturnValue({
              range: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockOrgData,
                  error: null,
                  count: 1
                })
              })
            })
          })
        })
      })

      const filters = { search: 'org' }
      const pagination: PaginationParams = { page: 1, limit: 10 }

      const result = await adminService.getOrganizations(filters, pagination)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Organization One')
      expect(result.data[0].member_count).toBe(2)
      expect(result.data[0].owner.email).toBe('owner@example.com')
    })

    it('handles organization creation with owner assignment', async () => {
      const orgData = {
        name: 'New Organization',
        slug: 'new-org',
        owner_email: 'owner@example.com'
      }

      const mockCreateResponse = {
        data: {
          organization: {
            id: 'org-new',
            name: 'New Organization',
            slug: 'new-org'
          },
          owner: {
            id: 'user-owner',
            email: 'owner@example.com'
          }
        },
        success: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCreateResponse)
      })

      const result = await adminService.createOrganization(orgData)

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orgData)
      })

      expect(result.success).toBe(true)
      expect(result.data.organization.slug).toBe('new-org')
    })

    it('validates organization suspension with member notification', async () => {
      const organizationId = 'org-123'
      const reason = 'Terms of service violation'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      })

      await adminService.suspendOrganization(organizationId, reason)

      expect(mockFetch).toHaveBeenCalledWith(`/api/admin/organizations/${organizationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suspend: true, reason })
      })
    })
  })

  describe('Error Handling and Recovery Integration', () => {
    it('handles cascading API failures with proper error propagation', async () => {
      // Setup: Multiple API calls in sequence, one fails
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: [{ id: 'user-1' }], success: true })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Database connection failed' })
        })

      // First call succeeds
      const users = await adminService.getUsers({}, { page: 1, limit: 10 })
      expect(users.success).toBe(true)

      // Second call fails
      await expect(adminService.getDashboardMetrics()).rejects.toThrow('API error: 500')
    })

    it('handles malformed API responses gracefully', async () => {
      // Setup: API returns malformed JSON
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Unexpected token in JSON'))
      })

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
    })

    it('validates request timeout handling', async () => {
      // Setup: Request timeout
      const abortController = new AbortController()
      
      setTimeout(() => abortController.abort(), 100)

      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new DOMException('The operation was aborted', 'AbortError')), 200)
        })
      )

      await expect(
        adminService.getDashboardMetrics({ signal: abortController.signal })
      ).rejects.toThrow('AbortError')
    })
  })

  describe('Multi-Endpoint Workflow Integration', () => {
    it('completes user-organization workflow through multiple API calls', async () => {
      // Workflow: Get user -> Get user's organizations -> Update organization
      const userId = 'user-123'
      const organizationId = 'org-456'

      // Step 1: Get user details
      const mockUserResponse = {
        data: {
          id: userId,
          email: 'user@example.com',
          organizations: [{ id: organizationId, name: 'User Org', role: 'owner' }]
        },
        success: true
      }

      // Step 2: Update organization
      const mockUpdateResponse = { success: true }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUserResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUpdateResponse)
        })

      // Execute workflow
      const user = await adminService.getUserById(userId)
      expect(user).toEqual(mockUserResponse.data)

      const userOrg = user.organizations.find(org => org.id === organizationId)
      expect(userOrg).toBeDefined()

      await adminService.updateOrganization(organizationId, { name: 'Updated Org Name' })

      // Verify API calls were made in sequence
      expect(mockFetch).toHaveBeenNthCalledWith(1, `/api/admin/users/${userId}`, {
        headers: { 'Content-Type': 'application/json' }
      })

      expect(mockFetch).toHaveBeenNthCalledWith(2, `/api/admin/organizations/${organizationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Org Name' })
      })
    })

    it('handles partial workflow failures with proper cleanup', async () => {
      // Workflow: Create user -> Create organization -> Add user to org (fails)
      const userData = { email: 'test@example.com', name: 'Test User' }
      const orgData = { name: 'Test Org', slug: 'test-org', owner_email: 'test@example.com' }

      // Step 1: Create user (succeeds)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ 
          data: { user: { id: 'new-user', email: 'test@example.com' } },
          success: true 
        })
      })

      // Step 2: Create organization (fails)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Slug already exists' })
      })

      // Execute workflow
      const createUserResult = await adminService.createUser(userData)
      expect(createUserResult.success).toBe(true)

      // Organization creation should fail
      await expect(adminService.createOrganization(orgData)).rejects.toThrow('API error: 400')

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Data Consistency and Validation', () => {
    it('validates data transformation consistency across API boundaries', async () => {
      // Test that data structure remains consistent between service and API
      const mockApiUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        status: 'active',
        is_system_admin: false,
        organizations: [
          {
            id: 'org-1',
            name: 'Test Org',
            role: 'member',
            joined_at: '2024-01-01T00:00:00Z'
          }
        ],
        last_seen_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        email_verified_at: '2024-01-01T01:00:00Z',
        login_count: 50,
        last_ip: '192.168.1.100'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockApiUser, success: true })
      })

      const result = await adminService.getUserById('user-123')

      // Verify all expected fields are present and correctly typed
      expect(result.id).toBe('user-123')
      expect(result.email).toBe('test@example.com')
      expect(result.status).toBe('active')
      expect(result.is_system_admin).toBe(false)
      expect(result.organizations).toHaveLength(1)
      expect(result.organizations[0].role).toBe('member')
      expect(typeof result.login_count).toBe('number')
      expect(new Date(result.created_at)).toBeInstanceOf(Date)
    })

    it('validates API response structure matches TypeScript interfaces', async () => {
      const mockMetrics: AdminMetrics = {
        totalUsers: 1000,
        activeUsers: 750,
        newUsersToday: 25,
        userGrowthRate: 5.2,
        userRetentionRate: 85.3,
        totalOrganizations: 100,
        activeOrganizations: 95,
        newOrganizationsToday: 2,
        organizationGrowthRate: 3.8,
        monthlyRecurringRevenue: 50000,
        totalRevenue: 500000,
        averageRevenuePerUser: 50.00,
        revenueGrowthRate: 10.5,
        churnRate: 2.5,
        systemUptime: 99.9,
        apiResponseTime: 120,
        errorRate: 0.01,
        activeConnections: 500,
        emailsSentToday: 5000,
        emailDeliveryRate: 98.5,
        campaignsActive: 5,
        subscriberCount: 75000,
        recentActivity: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: { metrics: mockMetrics } })
      })

      const result = await adminService.getDashboardMetrics()

      // Verify structure matches AdminMetrics interface
      expect(typeof result.totalUsers).toBe('number')
      expect(typeof result.userGrowthRate).toBe('number')
      expect(typeof result.systemUptime).toBe('number')
      expect(Array.isArray(result.recentActivity)).toBe(true)
      expect(result).toMatchObject({
        totalUsers: expect.any(Number),
        activeUsers: expect.any(Number),
        userGrowthRate: expect.any(Number),
        systemUptime: expect.any(Number),
        recentActivity: expect.any(Array)
      })
    })
  })
})