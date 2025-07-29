// Mock fetch globally
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Create stable mock object that can be used in jest.mock
const mockSupabaseInstance = {
  from: jest.fn()
}

// Mock the Supabase module before importing
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: jest.fn(() => mockSupabaseInstance)
}))

// Import after mocks are set up
import { adminService } from '../../lib/admin-service'
import { AdminUser, AdminOrganization, AdminMetrics } from '../../types'

// Create comprehensive Supabase mocks
const createMockSupabaseChain = (mockData: any = [], mockError: any = null, mockCount: number = 0) => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve({ data: mockData, error: mockError })),
      range: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: mockData, error: mockError, count: mockCount }))
      }))
    })),
    is: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve({ data: mockData, error: mockError })),
      gte: jest.fn(() => ({
        is: jest.fn(() => Promise.resolve({ data: mockData, error: mockError }))
      })),
      range: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: mockData, error: mockError, count: mockCount }))
      })),
      or: jest.fn(() => ({
        range: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockData, error: mockError, count: mockCount }))
        }))
      }))
    })),
    gte: jest.fn(() => ({
      is: jest.fn(() => Promise.resolve({ data: mockData, error: mockError }))
    })),
    order: jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve({ data: mockData, error: mockError }))
    })),
    limit: jest.fn(() => Promise.resolve({ data: mockData, error: mockError }))
  }))
})

// Console spy for testing error logging
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

// Mock console.error restoration
afterAll(() => {
  consoleErrorSpy.mockRestore()
})

describe('AdminService', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    consoleErrorSpy.mockClear()
    // Reset mock Supabase client to default
    mockSupabaseInstance.from.mockImplementation(() => createMockSupabaseChain())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getDashboardMetrics', () => {
    it('fetches dashboard metrics successfully', async () => {
      const mockMetrics = {
        totalUsers: 1000,
        activeUsers: 750,
        userGrowthRate: 12.5,
        systemUptime: 99.9
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { metrics: mockMetrics }
        })
      } as Response)

      const result = await adminService.getDashboardMetrics()

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/analytics?type=metrics', {
        headers: { 'Content-Type': 'application/json' },
        signal: undefined
      })
      expect(result).toEqual(mockMetrics)
    })

    it('handles API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard metrics:', expect.any(Error))
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard metrics:', expect.any(Error))
    })

    it('supports abort signals', async () => {
      const abortController = new AbortController()
      const mockMetrics = { totalUsers: 100 }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { metrics: mockMetrics }
        })
      } as Response)

      await adminService.getDashboardMetrics({ signal: abortController.signal })

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/analytics?type=metrics', {
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal
      })
    })

    it('handles abort errors correctly', async () => {
      const abortError = new Error('Request aborted')
      abortError.name = 'AbortError'
      
      mockFetch.mockRejectedValueOnce(abortError)

      await expect(adminService.getDashboardMetrics({ 
        signal: new AbortController().signal 
      })).rejects.toThrow(abortError)
    })

    it('handles API response with missing success field', async () => {
      const mockMetrics = { totalUsers: 1000 }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { metrics: mockMetrics }
          // Missing success field
        })
      } as Response)

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard metrics:', expect.any(Error))
    })

    it('handles API response with success: false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Custom error message'
        })
      } as Response)

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard metrics:', expect.any(Error))
    })

    it('handles API response with success: false and no error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false
        })
      } as Response)

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard metrics:', expect.any(Error))
    })

    it('handles malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        }
      } as Response)

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard metrics:', expect.any(Error))
    })
  })

  describe('getUsers', () => {
    it('fetches users with filters and pagination', async () => {
      const mockUsers: AdminUser[] = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User One',
          status: 'active',
          is_system_admin: false,
          organizations: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          last_seen_at: '2024-01-01T00:00:00Z',
          email_verified_at: '2024-01-01T00:00:00Z',
          avatar_url: null,
          login_count: 5,
          last_ip: '192.168.1.1'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockUsers,
          metadata: { total: 1, page: 1, limit: 20 }
        })
      } as Response)

      const filters = { search: 'user', status: 'active' }
      const pagination = { page: 1, limit: 20, sort: 'created_at', order: 'desc' as const }

      const result = await adminService.getUsers(filters, pagination)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/users?'),
        { headers: { 'Content-Type': 'application/json' } }
      )
      expect(result.data).toEqual(mockUsers)
    })

    it('handles getUsers with all filter parameters', async () => {
      const mockUsers: AdminUser[] = [{
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        status: 'active',
        is_system_admin: false,
        organizations: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_seen_at: '2024-01-01T00:00:00Z',
        email_verified_at: '2024-01-01T00:00:00Z',
        avatar_url: null,
        login_count: 5,
        last_ip: '192.168.1.1'
      }]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockUsers,
          metadata: { total: 1, page: 1, limit: 20 }
        })
      } as Response)

      const filters = {
        search: 'test',
        status: 'active',
        role: 'admin',
        organizationId: 'org-123'
      }
      const pagination = { page: 2, limit: 50, sort: 'email', order: 'asc' as const }

      const result = await adminService.getUsers(filters, pagination)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/page=2.*limit=50.*sort=email.*order=asc.*search=test.*status=active.*role=admin.*organizationId=org-123/),
        { headers: { 'Content-Type': 'application/json' } }
      )
      expect(result.data).toEqual(mockUsers)
    })

    it('handles empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          metadata: { total: 0, page: 1, limit: 20 }
        })
      } as Response)

      const result = await adminService.getUsers({}, { page: 1, limit: 20, sort: 'created_at', order: 'desc' })

      expect(result.data).toEqual([])
      expect(result.metadata?.total).toBe(0)
    })

    it('handles getUsers network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.getUsers({}, { page: 1, limit: 20 })).rejects.toThrow('Failed to fetch users')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching users:', expect.any(Error))
    })

    it('handles getUsers API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      await expect(adminService.getUsers({}, { page: 1, limit: 20 })).rejects.toThrow('Failed to fetch users')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching users:', expect.any(Error))
    })
  })

  describe('getUserById', () => {
    it('fetches a single user by ID', async () => {
      const mockUser: AdminUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        status: 'active',
        is_system_admin: false,
        organizations: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_seen_at: '2024-01-01T00:00:00Z',
        email_verified_at: '2024-01-01T00:00:00Z',
        avatar_url: null,
        login_count: 10,
        last_ip: '192.168.1.1'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockUser
        })
      } as Response)

      const result = await adminService.getUserById('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/1', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual(mockUser)
    })

    it('handles getUserById network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.getUserById('user-123')).rejects.toThrow('Failed to fetch user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user:', expect.any(Error))
    })

    it('handles getUserById API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response)

      await expect(adminService.getUserById('user-123')).rejects.toThrow('Failed to fetch user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user:', expect.any(Error))
    })
  })

  describe('updateUser', () => {
    it('updates a user successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      await adminService.updateUser('1', { name: 'Updated Name' })

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Name' })
      })
    })

    it('handles updateUser network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.updateUser('user-123', { name: 'New Name' })).rejects.toThrow('Failed to update user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating user:', expect.any(Error))
    })

    it('handles updateUser API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      } as Response)

      await expect(adminService.updateUser('user-123', { name: 'Invalid' })).rejects.toThrow('Failed to update user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating user:', expect.any(Error))
    })
  })

  describe('suspendUser', () => {
    it('suspends a user with reason', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      await adminService.suspendUser('1', 'Violation of terms')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend: true, reason: 'Violation of terms' })
      })
    })

    it('suspends a user without reason', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      await adminService.suspendUser('user-123')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/user-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend: true, reason: undefined })
      })
    })

    it('handles suspendUser network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.suspendUser('user-123', 'Reason')).rejects.toThrow('Failed to suspend user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error suspending user:', expect.any(Error))
    })

    it('handles suspendUser API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      } as Response)

      await expect(adminService.suspendUser('user-123')).rejects.toThrow('Failed to suspend user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error suspending user:', expect.any(Error))
    })
  })

  describe('activateUser', () => {
    it('activates a suspended user', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      await adminService.activateUser('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate: true })
      })
    })

    it('handles activateUser network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.activateUser('user-123')).rejects.toThrow('Failed to activate user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error activating user:', expect.any(Error))
    })

    it('handles activation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      await expect(adminService.activateUser('1')).rejects.toThrow('Failed to activate user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error activating user:', expect.any(Error))
    })
  })

  describe('deleteUser', () => {
    it('deletes a user successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      await adminService.deleteUser('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('handles deleteUser network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.deleteUser('user-123')).rejects.toThrow('Failed to delete user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting user:', expect.any(Error))
    })

    it('handles deletion errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response)

      await expect(adminService.deleteUser('1')).rejects.toThrow('Failed to delete user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting user:', expect.any(Error))
    })
  })

  describe('bulkUserAction', () => {
    it('performs bulk actions on users', async () => {
      const mockResult = {
        success: true,
        message: 'Bulk suspend completed: 2 successful, 0 failed',
        results: [
          { user_id: '1', success: true },
          { user_id: '2', success: true }
        ],
        summary: { total: 2, successful: 2, failed: 0 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult
      } as Response)

      const result = await adminService.bulkUserAction('suspend', ['1', '2'])

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suspend',
          user_ids: ['1', '2']
        })
      })
      expect(result).toEqual(mockResult)
    })

    it('handles bulk actions with additional data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, results: [] })
      } as Response)

      await adminService.bulkUserAction('update', ['1', '2'], { 
        status: 'inactive',
        reason: 'Bulk update'
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          user_ids: ['1', '2'],
          status: 'inactive',
          reason: 'Bulk update'
        })
      })
    })

    it('handles empty bulk action user IDs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'No users to process',
          results: [],
          summary: { total: 0, successful: 0, failed: 0 }
        })
      } as Response)

      const result = await adminService.bulkUserAction('suspend', [])

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suspend',
          user_ids: []
        })
      })
      expect(result.summary?.total).toBe(0)
    })

    it('handles bulkUserAction network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.bulkUserAction('suspend', ['1', '2'])).rejects.toThrow('Failed to perform bulk action')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error performing bulk action:', expect.any(Error))
    })

    it('handles bulkUserAction API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      } as Response)

      await expect(adminService.bulkUserAction('delete', ['1', '2'])).rejects.toThrow('Failed to perform bulk action')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error performing bulk action:', expect.any(Error))
    })
  })

  describe('createUser', () => {
    it('creates a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        send_invitation: true
      }

      const mockResult = {
        success: true,
        data: { id: '123', email: 'newuser@example.com' },
        message: 'User created and invitation sent'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult
      } as Response)

      const result = await adminService.createUser(userData)

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      expect(result).toEqual(mockResult)
    })

    it('handles createUser network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.createUser({ email: 'test@example.com' })).rejects.toThrow('Failed to create user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating user:', expect.any(Error))
    })

    it('handles createUser API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      } as Response)

      await expect(adminService.createUser({ email: 'invalid-email' })).rejects.toThrow('Failed to create user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating user:', expect.any(Error))
    })
  })

  describe('getOrganizations', () => {
    it('fetches organizations with pagination', async () => {
      const mockOrgs = [
        {
          id: '1',
          name: 'Test Org',
          slug: 'test-org',
          status: 'active' as const,
          plan: 'pro' as const,
          member_count: 5,
          monthly_revenue: 1000,
          storage_used: 50,
          storage_limit: 100,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          owner: {
            id: 'owner-1',
            name: 'Owner Name',
            email: 'owner@example.com'
          }
        }
      ]

      // Mock the Supabase query response with proper structure
      const mockSupabaseData = [{
        id: '1',
        name: 'Test Org',
        slug: 'test-org',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        memberships: [{
          role: 'owner',
          users: {
            id: 'owner-1',
            name: 'Owner Name',
            email: 'owner@example.com'
          }
        }]
      }]

      mockSupabaseInstance.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          is: jest.fn(() => ({
            range: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: mockSupabaseData,
                error: null,
                count: 1
              }))
            }))
          }))
        }))
      }))

      const filters = {}
      const pagination = { page: 1, limit: 20 }

      const result = await adminService.getOrganizations(filters, pagination)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0].name).toBe('Test Org')
    })

    it('handles getOrganizations with search filter', async () => {
      const mockSupabaseData = [{
        id: '1',
        name: 'Test Org',
        slug: 'test-org',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        memberships: [{
          role: 'owner',
          users: {
            id: 'owner-1',
            name: 'Owner Name',
            email: 'owner@example.com'
          }
        }]
      }]

      mockSupabaseInstance.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          is: jest.fn(() => ({
            or: jest.fn(() => ({
              range: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({
                  data: mockSupabaseData,
                  error: null,
                  count: 1
                }))
              }))
            }))
          }))
        }))
      }))

      const filters = { search: 'test' }
      const pagination = { page: 1, limit: 20 }
      const result = await adminService.getOrganizations(filters, pagination)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0].name).toBe('Test Org')
    })

    it('handles getOrganizations with database error', async () => {
      mockSupabaseInstance.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          is: jest.fn(() => ({
            range: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: null,
                error: new Error('Database connection failed'),
                count: 0
              }))
            }))
          }))
        }))
      }))

      await expect(adminService.getOrganizations({}, { page: 1, limit: 20 })).rejects.toThrow('Database connection failed')
    })

    it('handles organizations without owner', async () => {
      const mockSupabaseData = [{
        id: '1',
        name: 'Orphaned Org',
        slug: 'orphaned-org',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        memberships: [{
          role: 'member',
          users: {
            id: 'user-1',
            name: 'Member User',
            email: 'member@test.com'
          }
        }]
      }]

      mockSupabaseInstance.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          is: jest.fn(() => ({
            range: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: mockSupabaseData,
                error: null,
                count: 1
              }))
            }))
          }))
        }))
      }))

      const result = await adminService.getOrganizations({}, { page: 1, limit: 20 })
      expect(result.success).toBe(true)
      expect(result.data![0].owner.id).toBe('')
      expect(result.data![0].owner.name).toBe('')
      expect(result.data![0].owner.email).toBe('')
    })

    it('handles null memberships', async () => {
      const mockSupabaseData = [{
        id: '1',
        name: 'Empty Org',
        slug: 'empty-org',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        memberships: null
      }]

      mockSupabaseInstance.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          is: jest.fn(() => ({
            range: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: mockSupabaseData,
                error: null,
                count: 1
              }))
            }))
          }))
        }))
      }))

      const result = await adminService.getOrganizations({}, { page: 1, limit: 20 })
      expect(result.success).toBe(true)
      expect(result.data![0].member_count).toBe(0)
    })
  })

  describe('getOrganizationById', () => {
    it('fetches a single organization by ID', async () => {
      const mockOrg: AdminOrganization = {
        id: '1',
        name: 'Test Org',
        slug: 'test-org',
        status: 'active',
        plan: 'pro',
        member_count: 5,
        monthly_revenue: 1000,
        storage_used: 50,
        storage_limit: 100,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        owner: {
          id: 'owner-1',
          name: 'Owner Name',
          email: 'owner@example.com'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockOrg
        })
      } as Response)

      const result = await adminService.getOrganizationById('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/organizations/1', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual(mockOrg)
    })

    it('handles getOrganizationById network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.getOrganizationById('org-123')).rejects.toThrow('Failed to fetch organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching organization:', expect.any(Error))
    })

    it('handles organization not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response)

      await expect(adminService.getOrganizationById('1')).rejects.toThrow('Failed to fetch organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching organization:', expect.any(Error))
    })
  })

  describe('updateOrganization', () => {
    it('updates an organization successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      await adminService.updateOrganization('1', { name: 'Updated Name' })

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/organizations/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Name' })
      })
    })

    it('handles updateOrganization network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.updateOrganization('org-123', { name: 'New Name' })).rejects.toThrow('Failed to update organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating organization:', expect.any(Error))
    })

    it('handles update errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      } as Response)

      await expect(adminService.updateOrganization('1', { name: 'Invalid' })).rejects.toThrow('Failed to update organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating organization:', expect.any(Error))
    })
  })

  describe('suspendOrganization', () => {
    it('suspends an organization with reason', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      await adminService.suspendOrganization('1', 'Policy violation')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/organizations/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend: true, reason: 'Policy violation' })
      })
    })

    it('suspends an organization without reason', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      await adminService.suspendOrganization('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/organizations/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend: true, reason: undefined })
      })
    })

    it('handles suspendOrganization network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.suspendOrganization('org-123', 'Policy violation')).rejects.toThrow('Failed to suspend organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error suspending organization:', expect.any(Error))
    })

    it('handles suspension errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      await expect(adminService.suspendOrganization('1')).rejects.toThrow('Failed to suspend organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error suspending organization:', expect.any(Error))
    })
  })

  describe('activateOrganization', () => {
    it('activates a suspended organization', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      await adminService.activateOrganization('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/organizations/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate: true })
      })
    })

    it('handles activateOrganization network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.activateOrganization('org-123')).rejects.toThrow('Failed to activate organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error activating organization:', expect.any(Error))
    })

    it('handles activation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      } as Response)

      await expect(adminService.activateOrganization('1')).rejects.toThrow('Failed to activate organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error activating organization:', expect.any(Error))
    })
  })

  describe('deleteOrganization', () => {
    it('deletes an organization successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      await adminService.deleteOrganization('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/organizations/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('handles deleteOrganization network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminService.deleteOrganization('org-123')).rejects.toThrow('Failed to delete organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting organization:', expect.any(Error))
    })

    it('handles deletion errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response)

      await expect(adminService.deleteOrganization('1')).rejects.toThrow('Failed to delete organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting organization:', expect.any(Error))
    })
  })

  describe('createOrganization', () => {
    it('creates a new organization', async () => {
      const orgData = {
        name: 'New Organization',
        slug: 'new-org',
        owner_email: 'owner@neworg.com'
      }

      const mockResult = {
        success: true,
        data: { id: '123', ...orgData },
        message: 'Organization created successfully'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult
      } as Response)

      const result = await adminService.createOrganization(orgData)

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData)
      })
      expect(result).toEqual(mockResult)
    })

    it('handles createOrganization network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const orgData = {
        name: 'Test Org',
        slug: 'test-org',
        owner_email: 'owner@test.com'
      }

      await expect(adminService.createOrganization(orgData)).rejects.toThrow('Failed to create organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating organization:', expect.any(Error))
    })

    it('handles creation errors', async () => {
      const orgData = {
        name: 'Invalid Org',
        slug: 'invalid-org',
        owner_email: 'invalid@email'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      } as Response)

      await expect(adminService.createOrganization(orgData)).rejects.toThrow('Failed to create organization')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating organization:', expect.any(Error))
    })
  })

  describe('Error Handling', () => {
    it('handles 401 unauthorized errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      } as Response)

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard metrics:', expect.any(Error))
    })

    it('handles 403 forbidden errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      } as Response)

      await expect(adminService.getUserById('1')).rejects.toThrow('Failed to fetch user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user:', expect.any(Error))
    })

    it('handles 500 server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      await expect(adminService.createUser({ email: 'test@example.com' })).rejects.toThrow('Failed to create user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating user:', expect.any(Error))
    })

    it('handles network timeout errors', async () => {
      const timeoutError = new Error('Network timeout')
      timeoutError.name = 'TimeoutError'
      
      mockFetch.mockRejectedValueOnce(timeoutError)

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard metrics:', expect.any(Error))
    })

    it('handles JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token')
        }
      } as Response)

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching dashboard metrics:', expect.any(Error))
    })

    it('handles null/undefined user IDs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      } as Response)

      await expect(adminService.getUserById('')).rejects.toThrow('Failed to fetch user')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user:', expect.any(Error))
    })
  })

  describe('Performance', () => {
    it('completes requests within reasonable time', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { metrics: {} } })
      } as Response)

      const startTime = performance.now()
      await adminService.getDashboardMetrics()
      const endTime = performance.now()

      // Should complete within 1 second (mock should be much faster)
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('handles concurrent requests correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { metrics: {} } })
      } as Response)

      const promises = [
        adminService.getDashboardMetrics(),
        adminService.getDashboardMetrics(),
        adminService.getDashboardMetrics()
      ]

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(3)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('handles mixed concurrent operations', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} })
      } as Response)

      const promises = [
        adminService.getDashboardMetrics(),
        adminService.getUserById('1'),
        adminService.getOrganizationById('1')
      ]

      const results = await Promise.allSettled(promises)
      
      expect(results).toHaveLength(3)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })

  // Test to cover the private methods that are not directly accessible
  // We'll test them through scenarios where they would be called
  describe('Private Method Coverage', () => {
    it('should cover private method paths when API fallbacks occur', async () => {
      // This test is to ensure coverage of private methods that are called internally
      // but not directly testable from the public API
      
      // Test getUserMetrics path when data is null
      mockSupabaseInstance.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          is: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))

      mockFetch.mockRejectedValueOnce(new Error('API Error'))
      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')

      // Test getOrganizationMetrics path when data is null
      mockSupabaseInstance.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          is: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))

      mockFetch.mockRejectedValueOnce(new Error('API Error'))
      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')

      // Test getRecentActivity path when data is null
      mockSupabaseInstance.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      }))

      mockFetch.mockRejectedValueOnce(new Error('API Error'))
      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Failed to fetch dashboard metrics')
    })
  })
})